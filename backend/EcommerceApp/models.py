from django.db import models
from django.utils import timezone


class User(models.Model):
    role = models.CharField(max_length=255, default='user')
    email = models.EmailField(unique=True)
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)


class Product(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sellingprice = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    units_sold = models.IntegerField(default=0)
    image1 = models.ImageField(upload_to='images/')
    image2 = models.ImageField(upload_to='images/', blank=True, null=True)
    image3 = models.ImageField(upload_to='images/', blank=True, null=True)
    image4 = models.ImageField(upload_to='images/', blank=True, null=True)
    description = models.TextField(blank=True)


class ElementCommande(models.Model):
    produit = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()


class Commande(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    elements_commandes = models.ManyToManyField(ElementCommande)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    ORDER_STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('shipped', 'Expédiée'),
        ('delivered', 'Livrée'),
        ('cancelled', 'Annulée'),
    )
    order_status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES)


class Paiement(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=255)
    payment_date = models.DateTimeField()


class ElementPanier(models.Model):
    produit = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()


class Panier(models.Model):
    user_session_id = models.CharField(max_length=255)
    elements_panier = models.ManyToManyField(ElementPanier)
    created_at = models.DateTimeField(default=timezone.now)


class Commentaire(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    content = models.TextField()
    stars = models.IntegerField()


class Image(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    url = models.URLField()


class Promotion(models.Model):
    code = models.CharField(max_length=255)
    discount = models.DecimalField(max_digits=5, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()


class HistoriqueCommande(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    commandes = models.ManyToManyField(Commande)


class StatistiquesVente(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    sales_count = models.IntegerField()
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2)














