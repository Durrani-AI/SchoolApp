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
                    confirmation: '',
                    sortAscending: true,
                    sortType: 'price'
                }
            },
            created() {
                this.fetchData()
            },
            methods: {
                async fetchData() {
                    const url = "http://localhost:3000/"
                    let response = await (fetch(url))
                    this.lessons = await response.json()
                },
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
                },
                sortedLessons() {
                    const type = this.sortType
                    const value = (lesson) => {
                        const v = lesson[type]
                        if (type === 'price') {
                            return parseFloat(String(v).replace(/[^0-9.]/g, ''))
                        }
                        return v
                    }
                    const sorted = [...this.lessons].sort((a, b) => {
                        const x = value(a)
                        const y = value(b)
                        if (typeof x === 'string') {
                            return x.localeCompare(y)
                        }
                        return x - y
                    })
                    return this.sortAscending ? sorted : sorted.reverse()
                }
            }
        }).mount('#app')