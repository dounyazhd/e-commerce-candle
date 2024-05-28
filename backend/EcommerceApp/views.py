import hashlib
import random
import secrets
from bson import ObjectId, json_util
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from django.core.mail import send_mail
from django.http import HttpResponseBadRequest
from mypy.binder import defaultdict
from rest_framework.utils import json
from datetime import datetime, timedelta
import base64

from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import string
import nltk

from sklearn.feature_extraction.text import TfidfVectorizer

from django.views.decorators.csrf import csrf_exempt
import pandas as pd
import numpy as np
from sklearn.model_selection import cross_val_predict
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score

import io
from django.http import JsonResponse
from keras.preprocessing import image
from keras.applications.vgg16 import preprocess_input, VGG16
from sklearn.metrics.pairwise import cosine_similarity

from backend import settings
from db_connection import db

import spacy

from django.shortcuts import render


nlp = spacy.load("en_core_web_sm")


#Products Database
@csrf_exempt
def create_product(request):
    if request.method == 'POST':
        try:
            images = request.FILES.getlist('images')
            name = request.POST.get('productName')
            category = request.POST.get('productCategory')
            price = float(request.POST.get('productPrice'))
            sellingprice = float(request.POST.get('productSellingPrice'))
            stock = int(request.POST.get('productStock'))
            units_sold = int(request.POST.get('productUnitsSold', 0))
            description = request.POST.get('productDescription')

            if not all([images, name, category, price, sellingprice, stock, description]):
                return JsonResponse({'message': 'Missing required fields'}, status=400)

            image_data_list = []
            for image in images:
                image_data = base64.b64encode(image.read()).decode('utf-8')
                image_data_list.append({'image_data': image_data})

            product = {
                'name': name,
                'category': category,
                'price': price,
                'sellingprice': sellingprice,
                'stock': stock,
                'units_sold': units_sold,
                'description': description,
                'images': image_data_list,
                'comments': []
            }

            result = db.products.insert_one(product)

            return JsonResponse({'message': 'Product created successfully!', 'product_id': str(result.inserted_id)})
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def add_comment(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        comment = data.get('comment')
        username = data.get('username', 'Unknown')
        order_id = data.get('order_id')
        product_id = data.get('product_id')

        existing_order = db.orders.find_one({'_id': ObjectId(order_id)})
        if not existing_order:
            return JsonResponse({'message': 'Order not found'}, status=404)

        product_in_order = next((p for p in existing_order['products'] if str(p['_id']) == product_id), None)
        if not product_in_order:
            return JsonResponse({'message': 'Product not found in the order'}, status=404)

        existing_comments = product_in_order.get('comments', [])
        if any(c['username'] == username for c in existing_comments):
            return JsonResponse({'message': 'You have already commented on this product in this order'}, status=400)

        new_comment = {'username': username, 'comment': comment}
        existing_comments.append(new_comment)
        db.orders.update_one(
            {'_id': ObjectId(order_id), 'products._id': ObjectId(product_id)},
            {'$set': {'products.$.comments': existing_comments}}
        )
        return JsonResponse({'message': 'Comment added successfully!'})
    return JsonResponse({'message': 'Method not allowed'}, status=405)



nltk.download('vader_lexicon')
nltk.download('stopwords')


def clean_text(text):
    tokens = word_tokenize(text)

    table = str.maketrans('', '', string.punctuation)
    stripped = [word.translate(table) for word in tokens]

    stop_words = set(stopwords.words('english'))
    words = [word for word in stripped if word.lower() not in stop_words]

    cleaned_text = ' '.join(words)
    return cleaned_text


@csrf_exempt
def comments_product(request, product_id):
    if request.method == 'GET':

        product = db.products.find_one({'_id': ObjectId(product_id)})
        comments = product.get('comments', [])

        total_score = 0
        num_comments = 0

        sia = SentimentIntensityAnalyzer()

        for comment_obj in comments:
            comment = comment_obj.get('comment', '')
            if comment:
                cleaned_comment = clean_text(comment)
                sentiment_score = sia.polarity_scores(cleaned_comment)['compound']
                rating = round((sentiment_score + 1) * 2.5)

                total_score += rating
                num_comments += 1

        if num_comments > 0:
            global_rating = round(total_score / num_comments, 1)
        else:
            global_rating = None

        db.products.update_one(
            {'_id': ObjectId(product_id)},
            {'$set': {'global_rating': global_rating}}
        )

        return JsonResponse({'global_rating': global_rating}, safe=False)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def get_related_products(request):
    product_id = request.GET.get('product_id')
    if not product_id:
        return JsonResponse({"error": "Product ID is required"}, status=400)

    try:
        products = list(db.products.find({}))
        product_data = []

        for product in products:
            product_data.append({
                'id': product['_id'],
                'name': product['name'],
                'description': product['description'],
            })

        df = pd.DataFrame(product_data)

        df['combined'] = df['name'] + ' ' + df['description']

        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(df['combined'])

        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

        product_idx = df.index[df['id'] == product_id].tolist()[0]

        sim_scores = list(enumerate(cosine_sim[product_idx]))

        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        related_product_indices = [i[0] for i in sim_scores if i[0] != product_idx]

        related_products = df.iloc[related_product_indices].head(5)

        related_products_list = related_products[['id', 'name', 'description']].to_dict('records')

        return JsonResponse(related_products_list, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def read_product(request, product_id):
    if request.method == 'GET':
        product = db.products.find_one({'_id': ObjectId(product_id)})
        if product:
            product['_id'] = str(product['_id'])
            return JsonResponse(product, json_dumps_params={'default': json_util.default})
        return JsonResponse({'message': 'Product not found'}, status=404)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def update_product(request, product_id):
    if request.method == 'PUT':
        data = json.loads(request.body)

        if int(request.META.get('CONTENT_LENGTH', 0)) > settings.DATA_UPLOAD_MAX_MEMORY_SIZE:
            return JsonResponse({'message': 'Request body exceeded maximum size.'}, status=400)

        if not ObjectId.is_valid(product_id):
            return JsonResponse({'message': 'Invalid product ID'}, status=400)

        update_fields = {}
        for key in ['name', 'category', 'price', 'sellingprice', 'stock', 'units_sold', 'description', 'images']:
            if key in data:
                update_fields[key] = data[key]

        if not update_fields:
            return JsonResponse({'message': 'No fields to update.'}, status=400)

        try:
            update_result = db.products.update_one(
                {'_id': ObjectId(product_id)},
                {'$set': update_fields}
            )
            if update_result.modified_count > 0:
                return JsonResponse({'message': 'Product updated successfully!'})
            return JsonResponse({'message': 'No product updated.'})
        except Exception as e:
            return JsonResponse({'message': f'Error updating product: {str(e)}'}, status=500)

    product = db.products.find_one({'_id': ObjectId(product_id)})
    if not product:
        return JsonResponse({'message': 'Product not found'}, status=404)

    product['_id'] = str(product['_id'])
    return JsonResponse(product, json_dumps_params={'default': json_util.default})


@csrf_exempt
def delete_product(request, product_id):
    if request.method == 'DELETE':
        try:
            product_id = ObjectId(product_id)
        except Exception:
            return JsonResponse({'message': 'Invalid product ID'}, status=400)

        delete_result = db.products.delete_one({'_id': product_id})
        if delete_result.deleted_count > 0:
            return JsonResponse({'message': 'Product deleted successfully!'})
        return JsonResponse({'message': 'No product deleted.'})
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def delete_all_products(request):
    if request.method == 'DELETE':
        db.products.delete_many({})
        return JsonResponse({'message': 'Tous les produits ont été supprimés'})
    else:
        return JsonResponse({'message': 'Méthode non autorisée'}, status=405)


@csrf_exempt
def get_product(request, product_id):
    if request.method == 'GET':
        try:
            product = db.products.find_one({'_id': ObjectId(product_id)})
            if not product:
                return JsonResponse({'message': 'Product not found'}, status=404)

            product['_id'] = str(product['_id'])
            images = product.get('images', [])
            for image in images:
                image_data = image.get('image_data')
                if image_data and not isinstance(image_data, str):
                    image['image_data'] = base64.b64encode(image_data).decode('utf-8')

            return JsonResponse(product, safe=False, json_dumps_params={'default': json_util.default})
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def get_all_products(request):
    if request.method == 'GET':
        products = list(db.products.find({}))
        for product in products:
            product['_id'] = str(product['_id'])
            images = product.get('images')
            if images:
                for image in images:
                    image_data = image['image_data']
                    if isinstance(image_data, bytes):
                        image['image_data'] = base64.b64encode(image_data).decode('utf-8')

        search_term = request.GET.get('search', '')
        if search_term:
            products = [product for product in products if
                        search_term.lower() in product['name'].lower() or search_term.lower() in product[
                            'description'].lower()]

        sort_by = request.GET.get('sort')
        if sort_by == 'price_asc':
            products.sort(key=lambda x: x.get('sellingprice', 0))
        elif sort_by == 'price_desc':
            products.sort(key=lambda x: x.get('sellingprice', 0), reverse=True)
        elif sort_by == 'best_sellers':
            products.sort(key=lambda x: x.get('units_sold', 0), reverse=True)

        category = request.GET.get('category')
        if category:
            products = [product for product in products if product.get('category') == category]

        return JsonResponse(products, safe=False, json_dumps_params={'default': json_util.default})
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def get_best_sellers(request):
    if request.method == 'GET':
        products = list(db.products.find({}).sort('units_sold', -1).limit(4))
        for product in products:
            product['_id'] = str(product['_id'])
            images = product.get('images')
            if images:
                for image in images:
                    image_data = image['image_data']
                    if isinstance(image_data, bytes):
                        image['image_data'] = base64.b64encode(image_data).decode('utf-8')
        return JsonResponse(products, safe=False)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def get_all_categories(request):
    if request.method == 'GET':
        categories = db.products.distinct('category')
        return JsonResponse(categories, safe=False)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


#Users Database
@csrf_exempt
def send_confirmation_email(email, token):
    subject = 'Confirmation de votre inscription'
    confirmation_link = f'http://127.0.0.1:8000/confirm_email/{token}/'
    message = f'Merci de vous être inscrit! Veuillez confirmer votre adresse e-mail en cliquant sur ce lien avant 5min: {confirmation_link}'
    try:
        send_mail(subject, message, settings.EMAIL_HOST_USER, [email])
        return True
    except Exception as e:
        print(e)
        return False


@csrf_exempt
def create_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            if db.users.find_one({'username': username}):
                return JsonResponse({'message': 'Username already exists'}, status=400)

            role = data.get('role', 'user')
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            date_of_birth = data.get('date_of_birth')
            phone_number = int(data.get('phone_number')) if data.get('phone_number') else None
            email = data.get('email')
            password = data.get('password')
            address = data.get('address', 'Unknown')
            country = data.get('country', 'Unknown')
            city = data.get('city', 'Unknown')

            if not all([username, first_name, last_name, date_of_birth, phone_number, email, password]):
                return JsonResponse({'message': 'Missing required fields'}, status=400)

            token = secrets.token_urlsafe(16)
            if not send_confirmation_email(email, token):
                return JsonResponse({'message': 'Erreur lors de l envoi de l e-mail'}, status=400)

            hashed_password = make_password(password)

            user = {
                'role': role,
                'username': username,
                'first_name': first_name,
                'last_name': last_name,
                'date_of_birth': date_of_birth,
                'phone_number': phone_number,
                'email': email,
                'password': hashed_password,
                'address': address,
                'country': country,
                'city': city,
                'is_active': False,
                'activation_token': token,
                'activation_token_expiry': datetime.now() + timedelta(minutes=5)
            }

            result = db.users.insert_one(user)
            user_id = str(result.inserted_id)

            return JsonResponse({'message': 'User created successfully!', 'user_id': user_id})
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def confirm_email(request, token):
    try:
        user = db.users.find_one({'activation_token': token})
        if not user:
            return HttpResponseBadRequest('Token invalide')

        if user.get('activation_token_expiry') < datetime.now():
            return HttpResponseBadRequest('Le jeton a expiré')

        db.users.update_one({'_id': user['_id']}, {'$set': {'is_active': True}})
        return JsonResponse({'message': 'Email confirmed successfully!'})
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)


@csrf_exempt
def signin(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username_or_email = data.get('username_or_email')
        password = data.get('password')

        if not username_or_email or not password:
            return JsonResponse({'message': 'Username or email and password are required'}, status=400)

        user = db.users.find_one({'$or': [{'username': username_or_email}, {'email': username_or_email}]})

        if user is not None:
            if not user.get('is_active', True):
                return JsonResponse({'message': 'Please confirm your email address before signing in'}, status=401)

            if check_password(password, user['password']):
                return JsonResponse({'message': 'Authentication successful', 'user_id': str(user['_id'])})
            else:
                return JsonResponse({'message': 'Invalid password'}, status=401)
        else:
            return JsonResponse({'message': 'Invalid username or email'}, status=401)

    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def get_date_signin_users(request):
    if request.method == 'GET':
        users = list(db.users.find({}))

        month_counts = defaultdict(int)

        for user in users:
            if user.get('is_active', False):
                activation_token_expiry = user.get('activation_token_expiry')
                if activation_token_expiry:
                    month = activation_token_expiry.month
                    year = activation_token_expiry.year
                    date_key = datetime(year, month, 1).strftime('%Y-%m')
                    month_counts[date_key] += 1

        result = [{"month_year": month_year, "user_count": count} for month_year, count in month_counts.items()]
        return JsonResponse(result, status=200, safe=False)


def generate_random_password(length=8):
    letters_and_digits = string.ascii_letters + string.digits
    return ''.join(random.choice(letters_and_digits) for i in range(length))


@csrf_exempt
def forgot_password(request):
    if request.method == 'POST':
        user_email = request.POST.get('email')
        user = db.users.find_one({'email': user_email})

        if user:
            new_password = generate_random_password()
            hashed_password = hashlib.sha256(new_password.encode()).hexdigest()
            db.users.update_one(
                {'_id': user['_id']},
                {'$set': {'password': hashed_password}}
            )

            send_mail(
                'Password Reset',
                f'Your new password is: {new_password}',
                settings.EMAIL_HOST_USER,
                [user_email],
                fail_silently=False,
            )

            return JsonResponse({'message': 'Password reset successful'}, status=200)
        else:
            return JsonResponse({'message': 'Email not found'}, status=404)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def read_user(request, user_id):
    if request.method == 'GET':
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user:
            user['_id'] = str(user['_id'])
            return JsonResponse(user, json_dumps_params={'default': json_util.default})
        return JsonResponse({'message': 'User not found'}, status=404)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def update_user(request, user_id):
    if request.method == 'PUT':
        data = json.loads(request.body)

        if 'password' in data:
            user = db.users.find_one({'_id': ObjectId(user_id)})
            if user and 'old_password' in data and not check_password(data['old_password'], user['password']):
                return JsonResponse({'message': 'Incorrect old password.'}, status=400)
            if 'old_password' not in data:
                return JsonResponse({'message': 'Old password is required to update the password.'}, status=400)

        existing_user = db.users.find_one({'username': data.get('username')})
        if existing_user and existing_user['_id'] != ObjectId(user_id):
            return JsonResponse({'message': 'Username already exists.'}, status=400)

        update_fields = {}
        for key in ['role', 'username', 'first_name', 'last_name', 'date_of_birth', 'phone_number', 'email', 'address',
                    'country', 'city']:
            if key in data:
                update_fields[key] = data[key]

        if 'new_password' in data:
            update_fields['password'] = make_password(data['new_password'])

        if not update_fields:
            return JsonResponse({'message': 'No fields to update.'}, status=400)

        update_result = db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_fields}
        )
        if update_result.modified_count > 0:
            return JsonResponse({'message': 'User updated successfully!'})
        return JsonResponse({'message': 'No user updated.'})

    user = db.users.find_one({'_id': ObjectId(user_id)})
    if user:
        user['_id'] = str(user['_id'])
        return JsonResponse(user, json_dumps_params={'default': json_util.default})
    return JsonResponse({'message': 'User not found'}, status=404)


@csrf_exempt
def delete_user(request, user_id):
    if request.method == 'DELETE':
        try:
            user_id = ObjectId(user_id)
        except Exception:
            return JsonResponse({'message': 'Invalid user ID'}, status=400)

        delete_result = db.users.delete_one({'_id': user_id})
        if delete_result.deleted_count > 0:
            return JsonResponse({'message': 'User deleted successfully!'})
        return JsonResponse({'message': 'No user deleted.'})
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def get_all_users(request):
    if request.method == 'GET':
        users = list(db.users.find({}))
        for user in users:
            user['_id'] = str(user['_id'])
        return JsonResponse(users, safe=False, json_dumps_params={'default': json_util.default})
    return JsonResponse({'message': 'Method not allowed'}, status=405)


#Cart Database
@csrf_exempt
def add_to_cart(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        user_id = data.get('user_id')
        product_id = data.get('product').get('id')

        if db.users.find_one({'_id': ObjectId(user_id)}):
            quantity = data.get('product').get('quantity', 1)

            product = db.products.find_one({'_id': ObjectId(product_id)})
            product_name = product.get('name') if product else 'Unknown Product'
            product_sellingprice = product.get('sellingprice') if product else 'Unknown Price'
            product_images = product.get('images') if product else 'Unknown Images'

            cart = db.carts.find_one({'user_id': user_id})
            if cart:
                existing_items = cart.get('items', [])
                for item in existing_items:
                    if item.get('product_id') == product_id:
                        if item.get('quantity') == quantity:
                            return JsonResponse({'message': 'Product already in cart with the same quantity!'})
                        else:
                            item['quantity'] = quantity
                            db.carts.update_one({'user_id': user_id}, {'$set': {'items': existing_items}})
                            return JsonResponse({'message': 'Quantity updated successfully!'})
                            break
                else:
                    item = {'product_id': product_id,
                            'product_name': product_name,
                            'sellingprice': product_sellingprice,
                            'images': product_images,
                            'quantity': quantity
                            }
                    existing_items.append(item)

                db.carts.update_one({'user_id': user_id}, {'$set': {'items': existing_items}})
            else:
                cart_data = {'user_id': user_id,
                             'items': [{
                                 'product_id': product_id,
                                 'product_name': product_name,
                                 'sellingprice': product_sellingprice,
                                 'images': product_images,
                                 'quantity': quantity
                             }]
                             }
                db.carts.insert_one(cart_data)

            return JsonResponse({'message': 'Product added to cart successfully!'})
        return JsonResponse({'message': 'Not current user!'}, status=400)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def delete_from_cart(request, user_id, product_id):
    if request.method == 'DELETE':
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user:
            cart = db.carts.find_one({'user_id': user_id})
            if cart:
                existing_items = cart.get('items', [])
                updated_items = [item for item in existing_items if str(item.get('product_id')) == str(product_id)]
                db.carts.update_one({'user_id': user_id}, {'$set': {'items': updated_items}})
                return JsonResponse({'message': 'Product removed from cart successfully!'})
            else:
                return JsonResponse({'message': 'Cart not found for user!'}, status=404)
        return JsonResponse({'message': 'User not found!'}, status=404)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def modify_quantity(request, user_id, product_id, new_quantity):
    if request.method == 'PUT':
        try:
            new_quantity = float(new_quantity)
            cart = db.carts.find_one({'user_id': user_id})
            if cart:
                for item in cart['items']:
                    if item['product_id'] == product_id:
                        item['quantity'] = max(1, item['quantity'] + new_quantity)
                        db.carts.update_one(
                            {'user_id': user_id},
                            {'$set': {'items': cart['items']}}
                        )
                        return JsonResponse({'message': 'Quantity updated successfully'})
                return JsonResponse({'message': 'Product not found in cart'}, status=404)
            else:
                return JsonResponse({'message': 'Cart not found'}, status=404)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def get_cart(request, user_id):
    if request.method == 'GET':
        cart = db.carts.find_one({'user_id': user_id})
        if cart:
            items = cart.get('items', [])
            total_price_all_products = 0
            products = []
            for item in items:
                product_id = item.get('product_id')
                product = db.products.find_one({'_id': ObjectId(product_id)})
                if product:
                    sellingprice = product.get('sellingprice')
                    quantity = item.get('quantity')
                    total_price_product = sellingprice * quantity
                    total_price_all_products += total_price_product
                    product_data = {
                        'product_id': product_id,
                        'product_name': item.get('product_name'),
                        'quantity': quantity,
                        'sellingprice': sellingprice,
                        'total_price_product': total_price_product
                    }

                    images = product.get('images')
                    if images:
                        encoded_images = []
                        for image in images:
                            image_data = image.get('image_data')
                            if image_data:
                                if isinstance(image_data, str):
                                    try:
                                        image_data_bytes = base64.b64decode(image_data)
                                    except Exception as e:
                                        image_data_bytes = image_data.encode('utf-8')
                                else:
                                    image_data_bytes = image_data

                                encoded_image = base64.b64encode(image_data_bytes).decode('utf-8')
                                encoded_images.append({'image_data': encoded_image})

                        product_data['images'] = encoded_images

                    products.append(product_data)
            return JsonResponse({'products': products, 'total_price_all_products': total_price_all_products})
        return JsonResponse({'message': 'Cart not found for user!'}, status=404)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


#Whishlist Database
@csrf_exempt
def add_to_wishlist(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        user_id = data.get('user_id')
        product_id = data.get('product').get('id')

        if db.users.find_one({'_id': ObjectId(user_id)}):
            product = db.products.find_one({'_id': ObjectId(product_id)})
            product_name = product.get('name') if product else 'Unknown Product'
            product_sellingprice = product.get('sellingprice') if product else 'Unknown Price'
            product_images = product.get('images') if product else 'Unknown Images'

            wishlist = db.wishlists.find_one({'user_id': user_id})
            if wishlist:
                existing_items = wishlist.get('items', [])

                for item in existing_items:
                    if item.get('product_id') == product_id:
                        return JsonResponse({'message': 'Product already in wishlist!'})
                        break
                else:
                    item = {'product_id': product_id,
                            'product_name': product_name,
                            'product_sellingprice': product_sellingprice,
                            'product_images': product_images
                            }
                    existing_items.append(item)
                    db.wishlists.update_one({'_id': wishlist['_id']}, {'$set': {'items': existing_items}})
            else:
                wishlist_data = {'user_id': user_id, 'items': [{'product_id': product_id,
                                                                'product_name': product_name,
                                                                'product_sellingprice': product_sellingprice,
                                                                'product_images': product_images
                                                                }]
                                 }
                db.wishlists.insert_one(wishlist_data)

            return JsonResponse({'message': 'Product added to wishlist successfully!'})
        return JsonResponse({'message': 'Not current user!'}, status=400)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def delete_from_wishlist(request, user_id, product_id):
    if request.method == 'DELETE':
        if db.users.find_one({'_id': ObjectId(user_id)}):
            wishlist = db.wishlists.find_one({'user_id': user_id})
            if wishlist:
                existing_items = wishlist.get('items', [])
                updated_items = [item for item in existing_items if str(item.get('product_id')) != str(product_id)]
                db.wishlists.update_one({'user_id': user_id}, {'$set': {'items': updated_items}})
                return JsonResponse({'message': 'Product removed from wishlist successfully!'})
            else:
                return JsonResponse({'message': 'Wishlist not found for user!'}, status=404)
        return JsonResponse({'message': 'User not found!'}, status=404)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def get_wishlist(request, user_id):
    if request.method == 'GET':
        wishlist = db.wishlists.find_one({'user_id': user_id})
        if wishlist:
            items = wishlist.get('items', [])
            products = []
            for item in items:
                product_id = item.get('product_id')
                product = db.products.find_one({'_id': ObjectId(product_id)})
                if product:
                    product_data = {
                        'product_id': str(product_id),
                        'product_name': item.get('product_name'),
                        'sellingprice': product.get('sellingprice'),
                    }

                    images = product.get('images')
                    if images:
                        encoded_images = []
                        for image in images:
                            image_data = image.get('image_data')
                            if image_data:
                                if isinstance(image_data, str):
                                    try:
                                        image_data_bytes = base64.b64decode(image_data)
                                    except Exception as e:
                                        image_data_bytes = image_data.encode('utf-8')
                                else:
                                    image_data_bytes = image_data

                                encoded_image = base64.b64encode(image_data_bytes).decode('utf-8')
                                encoded_images.append({'image_data': encoded_image})

                        product_data['images'] = encoded_images

                    products.append(product_data)
            return JsonResponse({'products': products})
        return JsonResponse({'message': 'Wishlist not found for user!'}, status=404)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


#Orders Database
@csrf_exempt
def create_order(request):
    if request.method == 'POST':
        PAYMENT_METHOD_CHOICES = [
            ('bank_transfer', 'virement bancaire'),
            ('credit_card', 'Credit Card'),
            ('paypal', 'PayPal'),
            ('cash_on_delivery', 'Cash on Delivery'),
        ]

        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            phone_number = data.get('phone_number')
            company_name = data.get('company_name')
            country = data.get('country')
            city = data.get('city')
            address = data.get('address')
            zip_code = data.get('zip')
            status = data.get('status', 'pending')
            payment_method = data.get('payment_method')
            promotion_code = data.get('promotion_code')

            if not (user_id and first_name and last_name and phone_number and address and country and city and payment_method):
                return JsonResponse({'message': 'Missing required fields'}, status=400)

            user = db.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return JsonResponse({'message': 'User not found'}, status=404)

            username = user.get('username')

            cart = db.carts.find_one({'user_id': user_id})
            if not cart:
                return JsonResponse({'message': 'Cart not found'}, status=404)

            if payment_method not in [choice[0] for choice in PAYMENT_METHOD_CHOICES]:
                return JsonResponse({'message': 'Invalid payment method'}, status=400)

            products = []
            total_price = 0

            for item in cart.get('items', []):
                product_id = item.get('product_id')
                quantity = item.get('quantity', 1)
                product_details = db.products.find_one({'_id': ObjectId(product_id)})
                if not product_details:
                    return JsonResponse({'message': f'Product with ID {product_id} not found'}, status=404)

                product = {
                    'product_id': product_id,
                    'name': product_details.get('name'),
                    'price': product_details.get('price'),
                    'sellingprice': product_details.get('sellingprice'),
                    'images': product_details.get('images'),
                    'quantity': quantity
                }
                products.append(product)
                total_price += product['sellingprice'] * quantity

                db.products.update_one({'_id': ObjectId(product_id)}, {'$inc': {'stock': -quantity, 'units_sold': quantity}})

            if promotion_code:
                promotion = db.promotions.find_one({'code': promotion_code, 'active': True})
                if promotion:
                    discount = float(promotion['discount'])
                    total_price = total_price * (1 - discount / 100)
                else:
                    return JsonResponse({'message': 'Promotion not found or not active'}, status=404)

            order = {
                'user_id': user_id,
                'username': username,
                'first_name': first_name,
                'last_name': last_name,
                'phone_number': phone_number,
                'company_name': company_name,
                'country': country,
                'city': city,
                'address': address,
                'zip': zip_code,
                'order_date': datetime.now().isoformat(),
                'status': status,
                'payment_method': payment_method,
                'products': products,
                'total_price': total_price
            }

            result = db.orders.insert_one(order)
            order_id = str(result.inserted_id)

            db.users.update_one({'_id': ObjectId(user_id)}, {'$push': {'orders': ObjectId(order_id)}})
            db.carts.delete_one({'user_id': user_id})

            if payment_method == 'bank_transfer':
                return JsonResponse({
                    'message': 'Customer service will contact you to confirm your order and proceed with the bank transfer.'})
            return JsonResponse({'message': 'Order created successfully!', 'order_id': order_id})
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def validate_coupon(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            coupon_code = data.get('couponCode')
            total_price = data.get('totalPrice')

            promotion = db.promotions.find_one({'code': coupon_code, 'active': True})

            if promotion:
                discount_amount = promotion['discount']
                new_price = total_price - (total_price * (discount_amount / 100))

                return JsonResponse({'newPrice': new_price})
            else:
                return JsonResponse({'message': 'Coupon not found or not active'}, status=404)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def update_order(request, order_id):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            update_fields = {}

            if 'is_paid' in data:
                is_paid = data['is_paid']
                if not isinstance(is_paid, bool):
                    return JsonResponse({'status': 'error', 'message': 'Invalid value for is_paid'}, status=400)
                update_fields['is_paid'] = is_paid

            if 'status' in data:
                status = data['status']
                if status not in ['Pending', 'On the way', 'Delivered']:
                    return JsonResponse({'status': 'error', 'message': 'Invalid value for status'}, status=400)
                update_fields['status'] = status

            result = db.orders.update_one(
                {'_id': ObjectId(order_id)},
                {'$set': update_fields}
            )

            if result.modified_count == 1:
                return JsonResponse({'status': 'success'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Order not found or already updated'}, status=404)

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_all_orders(request):
    if request.method == 'GET':
        try:
            orders = list(db.orders.find({}))
            for order in orders:
                order['_id'] = str(order['_id'])

                products = []
                for product in order.get('products', []):
                    product_id = product.get('product_id')
                    product_details = db.products.find_one({'_id': ObjectId(product_id)})
                    if product_details:
                        product_info = {
                            'product_id': str(product_id),
                            'name': product_details.get('name'),
                            'sellingprice': product_details.get('sellingprice'),
                            'images': product_details.get('images'),
                            'quantity': product.get('quantity')
                        }
                        products.append(product_info)
                    else:
                        print(f"Product details not found for product_id: {product_id}")
                order['products'] = products
                total_price = sum(product['sellingprice'] * product['quantity'] for product in products)
                order['total_price'] = total_price

            return JsonResponse(orders, safe=False)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def get_orders_for_user(request, user_id):
    if request.method == 'GET':
        try:
            user = db.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return JsonResponse({'message': 'User not found'}, status=404)

            orders = list(db.orders.find({'user_id': user_id}))
            orders_count = len(orders)

            user['number_of_orders'] = orders_count

            for order in orders:
                order['_id'] = str(order['_id'])
                total_price = sum(product['sellingprice'] * product['quantity'] for product in order['products'])
                order['total_price'] = total_price

                products = []
                for product in order['products']:
                    product_id = product.get('product_id')
                    product_details = db.products.find_one({'_id': ObjectId(product_id)})
                    if product_details:
                        product_info = {
                            'product_id': product_id,
                            'name': product_details.get('name'),
                            'sellingprice': product_details.get('sellingprice'),
                            'images': product_details.get('images'),
                            'quantity': product.get('quantity')
                        }
                        products.append(product_info)
                order['products'] = products

            return JsonResponse(orders, safe=False)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def cancel_order(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order_id = ObjectId(data.get('order_id'))

            if not order_id:
                return JsonResponse({'message': 'Missing required fields'}, status=400)

            order = db.orders.find_one({'_id': order_id})

            if not order:
                return JsonResponse({'message': 'Order not found'}, status=404)

            if order.get('status') != 'pending':
                return JsonResponse({'message': 'Only pending orders can be cancelled'}, status=400)

            for product in order.get('products', []):
                db.products.update_one(
                    {'_id': ObjectId(product['product_id'])},
                    {'$inc': {'stock': product['quantity'], 'units_sold': -product['quantity']}}
                )

            db.orders.update_one(
                {'_id': ObjectId(order_id)},
                {'$set': {'status': 'cancelled'}}
            )

            return JsonResponse({'message': 'Order cancelled successfully!'})
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


#Promotion Database
@csrf_exempt
def create_promotion(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            code = data.get('code')
            discount = data.get('discount')
            active = data.get('active', True)

            if not (code and discount):
                return JsonResponse({'message': 'Missing required fields'}, status=400)

            if not isinstance(discount, (int, float)):
                return JsonResponse({'message': 'Discount must be a number'}, status=400)

            if db.promotions.find_one({'code': code}):
                return JsonResponse({'message': 'Promotion code already exists'}, status=400)

            promotion = {
                'code': code,
                'discount': discount,
                'active': active
            }

            result = db.promotions.insert_one(promotion)
            promotion_id = str(result.inserted_id)

            return JsonResponse({'message': 'Promotion created successfully!', 'promotion_id': promotion_id})
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def get_promotions(request):
    if request.method == 'GET':
        try:
            promotions = list(db.promotions.find({}))
            for promotion in promotions:
                promotion['_id'] = str(promotion['_id'])
            return JsonResponse(promotions, safe=False)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def toggle_activation(request, promotion_id):
    if request.method == 'PUT':
        try:
            promotion = db.promotions.find_one({'_id': ObjectId(promotion_id)})
            if promotion:
                new_active_state = not promotion.get('active', False)
                db.promotions.update_one({'_id': ObjectId(promotion_id)}, {'$set': {'active': new_active_state}})
                return JsonResponse({'message': 'Promotion activation toggled successfully'})
            else:
                return JsonResponse({'message': 'Promotion not found'}, status=404)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def delete_promotion(request):
    if request.method == 'DELETE':
        try:
            code = request.GET.get('code')
            result = db.promotions.delete_one({'code': code})
            if result.deleted_count > 0:
                return JsonResponse({'message': 'Promotion deleted successfully'})
            else:
                return JsonResponse({'message': 'Promotion not found'}, status=404)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def delete_all_promotions(request):
    if request.method == 'DELETE':
        try:
            result = db.promotions.delete_many({})
            return JsonResponse({'message': f'{result.deleted_count} promotions deleted successfully'})
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def send_promotion_email(request):
    if request.method == 'POST':
        print("Données POST reçues :", request.POST)
        subject = 'Promotions en cours !'
        message = 'Découvrez nos promotions en cours sur notre site.' + request.POST.get('content', '')
        users = list(db.users.find({}))
        for user in users:
            send_mail(subject, message, 'dounya.zahidi14@gmail.com', [user.get('email')])
        return JsonResponse({'message': 'E-mails envoyés avec succès à tous les utilisateurs'})
    return JsonResponse({'message': 'Méthode non autorisée'}, status=405)


#Machine Learning
@csrf_exempt
def calculate_monthly_profits():
    orders = db.orders.find({})

    monthly_profits = defaultdict(int)
    total_profit = 0

    for order in orders:
        order_date = order['order_date']
        selling_price = order['products'][0]['sellingprice']
        price = order['products'][0]['price']
        quantity = order['products'][0]['quantity']

        order_month = datetime.strptime(order_date, "%Y-%m-%dT%H:%M:%S.%f").month
        order_year = datetime.strptime(order_date, "%Y-%m-%dT%H:%M:%S.%f").year

        profit = (selling_price - price) * quantity
        monthly_profits[(order_year, order_month)] += profit
        total_profit += profit

    monthly_profits_list = [{"year": year, "month": month, "total_profit": profit} for (year, month), profit in
                            monthly_profits.items()]

    monthly_profits_list.sort(key=lambda x: (x['year'], x['month']))

    return {
        "monthly_profits": monthly_profits_list,
        "total_profit": total_profit
    }


@csrf_exempt
def monthly_profit_view(request):
    if request.method == 'GET':
        profits_data = calculate_monthly_profits()
        return JsonResponse(profits_data, safe=False)


#**********************************************************************************************************************#
label_encoder = LabelEncoder()


def prepare_data():
    orders = db.orders.find()

    data = []
    for order in orders:
        for product in order['products']:
            data.append({
                "date": order["order_date"],
                "name": product['name'],
                "units_sold": product['quantity'],
                "product_id": product["product_id"],
                "sellingprice": product["sellingprice"],
                "price": product["price"],
            })

    df = pd.DataFrame(data)

    df['date'] = pd.to_datetime(df['date'])
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df = df.groupby(['year', 'month', 'product_id']).agg({
        'units_sold': 'sum',
        'sellingprice': 'first',
        'price': 'first'
    }).reset_index()

    df['total_units_sold'] = df.groupby(['year', 'month', 'product_id'])['units_sold'].transform('sum')
    df['total_profit'] = calculate_profit(df['total_units_sold'], df['sellingprice'], df['price'])

    df['encoded_product_id'] = label_encoder.fit_transform(df['product_id'])

    return df


def train_model(df):
    X = df[['year', 'month', 'encoded_product_id']]
    y = df['units_sold']

    model = RandomForestRegressor()

    y_pred = cross_val_predict(model, X, y, cv=5)
    mse = mean_squared_error(y, y_pred)
    rmse = np.sqrt(mse)
    r_squared = r2_score(y, y_pred)

    model.fit(X, y)

    df['predicted_profit'] = calculate_profit(df['total_units_sold'], df['sellingprice'], df['price'])

    return model, rmse, r_squared


def retrain_model_if_needed(product_id):
    global df
    global model
    global rmse
    global r_squared
    global label_encoder

    if product_id not in label_encoder.classes_:
        df = prepare_data()
        model, rmse, r_squared = train_model(df)


def calculate_profit(units_sold, sellingprice, price):
    return (sellingprice - price) * units_sold


df = prepare_data()
model, rmse, r_squared = train_model(df)


def predict_sales(year, month, encoded_product_id):
    X_pred = pd.DataFrame({
        'year': [year],
        'month': [month],
        'encoded_product_id': [encoded_product_id]
    })

    prediction = model.predict(X_pred)
    return prediction[0]


@csrf_exempt
def predict_sales_view(request, date):
    if request.method == 'POST':
        try:
            date = datetime.strptime(date, '%Y-%m-%d')

            predictions = []
            for product_id in label_encoder.classes_:
                retrain_model_if_needed(product_id)

                encoded_product_id = label_encoder.transform([product_id])[0]

                prediction_units_sold = predict_sales(date.year, date.month, encoded_product_id)
                product = df[df['encoded_product_id'] == encoded_product_id].iloc[0]
                prediction_profit = calculate_profit(prediction_units_sold, product['sellingprice'], product['price'])

                product_test = db.products.find_one({'_id': ObjectId(product_id)})
                product_name = product_test.get("name")

                predictions.append({
                    "product_id": product['product_id'],
                    "name": product_name,
                    "predicted_units_sold": prediction_units_sold,
                    "predicted_profit": prediction_profit,
                })

            return JsonResponse({"predictions": predictions})
        except ValueError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method. Use POST."}, status=405)


#**********************************************************************************************************************#

vgg_model = VGG16(weights='imagenet', include_top=False, pooling='avg')


@csrf_exempt
def search_similar_products(request):
    if request.method == 'POST' and request.FILES.get('image'):
        uploaded_image = request.FILES['image']

        img_data = uploaded_image.read()
        img_bytes = io.BytesIO(img_data)

        img = image.load_img(img_bytes, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)

        features = vgg_model.predict(img_array)

        similar_products = find_similar_products(features)

        for product in similar_products:
            product['_id'] = str(product['_id'])
            product['similarity'] = float(product['similarity'])

        return JsonResponse({'results': similar_products})
    else:
        return JsonResponse({'error': 'Invalid request or no image uploaded'}, status=400)


def find_similar_products(query_features):
    all_products = db.products.find({})

    similar_products = []
    for product in all_products:
        for img_data in product['images']:
            img_bytes = io.BytesIO(base64.b64decode(img_data['image_data']))
            img = image.load_img(img_bytes, target_size=(224, 224))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)

            product_features = vgg_model.predict(img_array)

            similarity = cosine_similarity(query_features, product_features)[0][0]
            if similarity > 0.8:
                similar_products.append({'_id': product['_id'],
                                         'images': product['images'],
                                         'name': product['name'],
                                         'sellingprice': product['sellingprice'],
                                         'similarity': similarity,
                                         'image_data': img_data['image_data']
                                         })

    similar_products.sort(key=lambda x: x['similarity'], reverse=True)
    print(similar_products)

    return similar_products[:10]
