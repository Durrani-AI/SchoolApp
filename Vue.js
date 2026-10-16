const {createApp} = Vue
        createApp({
            data() {
                return {
                    lessons: [
                        { id: 1001, subject: 'Computer Science', location: 'Hendon', price: '£20', availability: 5, image: 'image.jpg' },
                        { id: 1002, subject: 'Mathematics', location: 'Colindale', price: '£15', availability: 5, image: 'image.jpg' },
                        { id: 1003, subject: 'English', location: 'Brent Cross', price: '£18', availability: 5, image: 'image.jpg' }
                    ],
                    order: {
                        name: '',
                        telephone: ''
                    },
                    cart: [],
                    displayCart: false,
                    confirmation: ''
                }
            },
            methods: {
                addToCart(lesson) {
                    this.cart.push(lesson.id)
                    lesson.availability--
                },
                removeFromCart(lesson) {
                    const index = this.cart.indexOf(lesson.id)
                    if (index !== -1) {
                        this.cart.splice(index, 1)
                        lesson.availability++
                    }
                },
                canAddToCart(lesson) {
                    return lesson.availability > 0
                },
                countInCart(id) {
                    return this.cart.filter(item => item === id).length
                },
                toggleCart() {
                    this.displayCart = !this.displayCart
                },
                checkout() {
                    this.confirmation = 'Order confirmed. Thank you, ' + this.order.name + '!'
                    this.cart = []
                    this.order.name = ''
                    this.order.telephone = ''
                    this.displayCart = false
                }
            },
            computed: {
                numberOfItems() {
                    return this.cart.length
                },
                canCheckout() {
                    return this.order.name.trim() !== '' && this.order.telephone.trim() !== ''
                }
            }
        }).mount('#app')