const {createApp} = Vue
        createApp({
            data() {
                return {
                    id: 1001,
                    subject: 'Computer Science',
                    location: 'Hendon',
                    price: '£20',
                    availability: 5,
                    cart: [],            
                    displayCart: false     
                }
            },
             methods: {
                addToCart() {               
                    this.cart.push(this.id)
                    this.availability--
                },
                toggleCart() {              
                    this.displayCart = !this.displayCart
                }
            },
            computed: {
                canAddToCart() {            
                    return this.availability > 0
                },
                numberOfItems() {           
                    return this.cart.length
                }
            }
        }).mount('#app')