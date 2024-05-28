from django.urls.conf import path
from EcommerceApp import views

urlpatterns = [

    path('create_product/', views.create_product, name='create_product'),

    path('product/add_comment/', views.add_comment, name='add_comment'),
    path('comments_product/<str:product_id>/', views.comments_product, name='comments_product'),
    path('get_related_products/', views.get_related_products, name='get_related_products'),


    path('read_product/<str:product_id>/', views.read_product, name='read_product'),
    path('update_product/<str:product_id>/', views.update_product, name='update_product'),
    path('delete_product/<str:product_id>/', views.delete_product, name='delete_product'),
    path('delete_all_products/', views.delete_all_products, name='delete_all_products'),

    path('get_all_products/', views.get_all_products, name='get_all_products'),
    path('get_product/<str:product_id>/', views.get_product, name='get_product'),
    path('get_best_sellers/', views.get_best_sellers, name='get_best_sellers'),
    path('get_all_categories/', views.get_all_categories, name='get_all_categories'),

    path('create_user/', views.create_user, name='create_user'),
    path('confirm_email/<str:token>/', views.confirm_email, name='confirm_email'),
    path('signin/', views.signin, name='signin'),
    path('get_date_signin_users/', views.get_date_signin_users, name='get_date_signin_users'),
    path('read_user/<str:user_id>/', views.read_user, name='read_user'),
    path('update_user/<str:user_id>/', views.update_user, name='update_user'),
    path('delete_user/<str:user_id>/', views.delete_user, name='delete_user'),
    path('get_all_users/', views.get_all_users, name='get_all_users'),

    path('product/add_to_cart/', views.add_to_cart, name='add_to_cart'),
    path('product/delete_from_cart/<str:user_id>/<str:product_id>/', views.delete_from_cart, name='delete_from_cart'),
    path('modify_quantity/<str:user_id>/<str:product_id>/<str:new_quantity>/', views.modify_quantity, name='modify_quantity'),
    path('get_cart/<str:user_id>/', views.get_cart, name='get_cart'),

    path('product/add_to_wishlist/', views.add_to_wishlist, name='add_to_wishlist'),
    path('product/delete_from_wishlist/<str:user_id>/<str:product_id>/', views.delete_from_wishlist, name='delete_from_wishlist'),
    path('get_wishlist/<str:user_id>/', views.get_wishlist, name='get_wishlist'),

    path('create_order/', views.create_order, name='create_order'),
    path('validate_coupon/', views.validate_coupon, name='validate_coupon'),
    path('update_order/<str:order_id>/', views.update_order, name='update_order'),
    path('cancel_order/', views.cancel_order, name='cancel_order'),
    path('get_all_orders/', views.get_all_orders, name='get_all_orders'),
    path('get_orders_for_user/<str:user_id>/', views.get_orders_for_user, name='get_orders_for_user'),

    path('create_promotion/', views.create_promotion, name='create_promotion'),
    path('get_promotions/', views.get_promotions, name='get_promotions'),
    path('toggle_activation/<str:promotion_id>/', views.toggle_activation, name='toggle_activation'),
    path('delete_promotion/', views.delete_promotion, name='delete_promotion'),
    path('delete_all_promotions/', views.delete_all_promotions, name='delete_all_promotions'),
    path('send_promotion_email/', views.send_promotion_email, name='send_promotion_email'),

    path('monthly_profit_view/', views.monthly_profit_view, name='monthly_profit_view'),

    path('predict_sales_view/<str:date>/', views.predict_sales_view, name='predict_sales_view'),

    path('search_similar_products/', views.search_similar_products, name='search_similar_products'),

]
