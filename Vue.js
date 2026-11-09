// Take the "createApp" tool out of the Vue library (Vue is loaded in index.html).
// "createApp" is what we use to build our Vue app.
const {createApp} = Vue

// The base web address (URL) of our backend server on Render.
// We keep it in ONE variable here so if the address ever changes, we only update this one line.
const API_URL = "https://backend-server-m01049109.onrender.com"

        // Start building our Vue app. Everything inside the { } is the app's settings.
        createApp({
            // "data" holds all the information (variables) the app remembers.
            // When any of this data changes, the web page updates by itself.
            data() {
                // Send back an object that holds all our starting values.
                return {
                    // "lessons" is a list of all the lessons. It starts EMPTY ([]) because
                    // the real lessons are loaded from MongoDB by fetchData().
                    // Each lesson from MongoDB has: _id (MongoDB's unique id), subject, location,
                    // price, and availability (how many spaces are left).
                    lessons: [],
                    // "loading" tracks whether we are still waiting for the server to send the lessons.
                    // Render's free server can take 30-60 seconds to wake up, so we show "Loading..." while true.
                    loading: true,
                    // "errorMessage" holds any error text if talking to the server goes wrong. Starts empty.
                    errorMessage: '',
                    // "order" holds what the user types in the checkout form.
                    order: {
                        // The user's name. It starts empty ('').
                        name: '',
                        // The user's phone number. It also starts empty.
                        telephone: ''
                    }, // End of the order object.
                    // "cart" is the shopping cart. It ONLY stores the MongoDB _id of each lesson added,
                    // not the full lesson details (so the database doesn't store repeated information).
                    // Example: ["65a1...", "65a1...", "65b2..."] means 2 of one lesson + 1 of another.
                    cart: [],
                    // "displayCart" decides which page to show.
                    // false = show the lessons list, true = show the checkout page.
                    displayCart: false,
                    // "confirmation" is the "thank you" message shown after ordering. Empty at the start.
                    confirmation: '',
                    // "sortAscending" decides the sort direction.
                    // true = low to high (A to Z), false = high to low (Z to A).
                    sortAscending: true,
                    // "sortType" decides what to sort the lessons by. It starts as 'price'.
                    sortType: 'price',
                    // "searchQuery" holds what the user types in the search box. Starts empty ('').
                    searchQuery: ''
                } // End of the data object.
            }, // End of data().
            // "created" runs automatically ONE time, as soon as the app is created.
            created() {
                // Call fetchData() to get the real lessons from the server straight away.
                this.fetchData()
            }, // End of created().
            // "methods" are functions (actions) the app can do, e.g. when a button is clicked.
            methods: {
                // fetchData gets the lessons from the server.
                // "async" means this function has to wait for things (like the internet).
                async fetchData() {
                    // Show the "Loading..." message while we wait for the server.
                    this.loading = true
                    // Clear any old error message before trying.
                    this.errorMessage = ''
                    // "try" attempts the code inside. If the internet/server fails, it jumps to "catch".
                    try {
                        // The web address (URL) of the server where the lessons are stored.
                        const url = API_URL + "/lessons"
                        // Ask the server for the lessons. "await" means: wait here until it answers.
                        let response = await fetch(url)
                        // Check if the server replied with an error (response.ok is false for 400/500 errors).
                        if (!response.ok) {
                            // Show a helpful error message on the page and stop here.
                            this.errorMessage = "Could not load lessons from the server. Please refresh to try again."
                            return
                        } // End of response.ok check.
                        // Turn the server's answer (JSON text) into a JavaScript list,
                        // and save it into "lessons". The page then updates automatically.
                        this.lessons = await response.json()
                    } catch (error) {
                        // If the server could not be reached at all (e.g. no Wi-Fi), show an error message.
                        this.errorMessage = "Failed to connect to the server. Please check your connection and refresh."
                    } finally {
                        // "finally" always runs at the end (whether it worked or failed).
                        // Turn off the "Loading..." message because we are done waiting.
                        this.loading = false
                    } // End of try/catch/finally.
                }, // End of fetchData().
                // imageUrl builds the full web address of a lesson's picture.
                // "path" is the image file name, e.g. 'image.jpg' or '/image.jpg'.
                imageUrl(path) {
                    // Turn path into text, remove any "/" at the start, then stick
                    // the server address in front. Result: "https://backend-server-m01049109.onrender.com/image.jpg"
                    return API_URL + "/" + String(path).replace(/^\/+/, '')
                }, // End of imageUrl().
                // addToCart puts a lesson into the shopping cart.
                addToCart(lesson) {
                    // Add this lesson's MongoDB _id to the end of the cart list.
                    this.cart.push(lesson._id)
                    // Take 1 away from the spaces left for this lesson.
                    lesson.availability--
                }, // End of addToCart().
                // removeFromCart takes one of this lesson out of the cart.
                removeFromCart(lesson) {
                    // Find the position of this lesson's _id in the cart.
                    // If it is not in the cart, indexOf gives back -1.
                    const index = this.cart.indexOf(lesson._id)
                    // Only continue if the lesson was found (the position is not -1).
                    if (index !== -1) {
                        // Remove 1 item from the cart at that position.
                        this.cart.splice(index, 1)
                        // Give the space back: add 1 to the spaces left.
                        lesson.availability++
                    } // End of the if check.
                }, // End of removeFromCart().
                // canAddToCart checks if a lesson can still be added.
                canAddToCart(lesson) {
                    // Gives back true if there is at least 1 space left, otherwise false.
                    // (Used to turn the "Add to cart" button on/off.)
                    return lesson.availability > 0
                }, // End of canAddToCart().
                // countInCart counts how many times a lesson is in the cart.
                countInCart(id) {
                    // "filter" keeps only the cart items that match this id,
                    // then ".length" counts how many are left.
                    return this.cart.filter(item => item === id).length
                }, // End of countInCart().
                // toggleCart switches between the lessons page and the checkout page.
                toggleCart() {
                    // "!" flips the value: true becomes false, false becomes true.
                    this.displayCart = !this.displayCart
                }, // End of toggleCart().
                // checkout sends the order to the server.
                // "async" because it has to wait for the server.
                async checkout() {
                    // Clear any previous error or confirmation message before sending the order.
                    this.errorMessage = ''
                    this.confirmation = ''
                    // Put all the order details together into one object.
                    const orderData = {
                        // The name the user typed in.
                        name: this.order.name,
                        // The phone number the user typed in (saved in the database as "phone").
                        phone: this.order.telephone,
                        // ONLY the list of lesson _ids in the cart - no subject, location, price etc.
                        lessonIDs: this.cart
                    } // End of orderData.
                    // "try" attempts to send the order and update the lessons. If anything fails, jump to "catch".
                    try {
                        // Send the order to the server and wait until it is done.
                        const response = await fetch(API_URL + "/orders", {
                            // "POST" means we are SENDING (saving) new data, not just getting it.
                            method: "POST",
                            // Tell the server that the data we send is in JSON format.
                            headers: { "Content-Type": "application/json" },
                            // Turn our orderData object into JSON text so it can be sent.
                            body: JSON.stringify(orderData)
                        }) // End of the fetch request.
                        // Check if saving the order worked (response.ok is true for status 200).
                        if (!response.ok) {
                            // Show an error message and stop here (do not clear the cart).
                            this.errorMessage = "Order failed to save. Please try again."
                            return
                        } // End of response.ok check.
                        // TASK 7.7: now tell the server the new number of spaces for each lesson that was ordered.
                        // Go through every lesson, one at a time.
                        for (const lesson of this.lessons) {
                            // Only update lessons that are actually in the cart (counted at least once).
                            if (this.countInCart(lesson._id) > 0) {
                                // Send a PUT request to save this lesson's new availability in the database.
                                const updateOk = await this.updateLesson(lesson)
                                // If updating a lesson's spaces failed, show an error and stop.
                                if (!updateOk) {
                                    this.errorMessage = "Order saved, but updating lesson spaces failed."
                                    return
                                } // End of updateOk check.
                            } // End of the "is it in the cart?" check.
                        } // End of the loop through the lessons.
                        // Make the "thank you" message, including the user's name.
                        this.confirmation = 'Order confirmed. Thank you, ' + this.order.name + '!'
                        // Empty the cart, because the order is finished.
                        this.cart = []
                        // Clear the name box in the form.
                        this.order.name = ''
                        // Clear the phone number box in the form.
                        this.order.telephone = ''
                        // Go back to the lessons page.
                        this.displayCart = false
                    } catch (error) {
                        // If the internet/server connection dropped during checkout, tell the user.
                        this.errorMessage = "Network error while placing order. Please try again."
                    } // End of try/catch.
                }, // End of checkout().
                // TASK 7.6 / 7.7: updateLesson sends a PUT request to change one lesson in the database.
                // "lesson" is the lesson we want to update.
                async updateLesson(lesson){
                    // The information we want to change. In Task 7.6 this was always 30.
                    // In Task 7.7 we send the lesson's CURRENT spaces left instead
                    // (this number already went down when the user clicked "Add to cart").
                    let updateBody = {
                        // The new number of spaces left for this lesson.
                        availability: lesson.availability
                    }; // End of updateBody.
                    // Build the address: the server's lessons route + this lesson's MongoDB _id.
                    // Example: "https://backend-server-m01049109.onrender.com/lessons/65a1b2c3..."
                    const url = API_URL + "/lessons/" + lesson._id;
                    // The settings for our request.
                    const options = {
                        // "PUT" means we are UPDATING something that already exists.
                        method: 'PUT',
                        // Tell the server that the data we send is in JSON format.
                        headers: {
                            'Content-Type': 'application/json'
                        }, // End of headers.
                        // Turn updateBody into JSON text so it can be sent.
                        body: JSON.stringify(updateBody)
                    } // End of options.
                    // Send the request to the server and wait for it to answer.
                    let response = await (fetch (url, options));
                    // Give back true if the update worked (status 200), or false if it failed.
                    return response.ok;
                                 } // End of updateLesson().
                                                                                                                                                                                        }, // End of methods.
            // "computed" values are worked out automatically from the data.
            // Whenever the data they use changes, they recalculate by themselves.
            computed: {
                // numberOfItems = how many items are in the cart.
                numberOfItems() {
                    // The length of the cart list is the number of items in it.
                    return this.cart.length
                }, // End of numberOfItems.
                // canCheckout = is the user allowed to press "Checkout"?
                canCheckout() {
                    // True only if BOTH the name AND the phone number are filled in.
                    // ".trim()" removes spaces, so typing only spaces does not count.
                    // "&&" means "and" - both sides must be true.
                    return this.order.name.trim() !== '' && this.order.telephone.trim() !== ''
                }, // End of canCheckout.
                // sortedLessons = the lessons list, put in the order the user chose.
                sortedLessons() {
                    // Save what we are sorting by (e.g. 'price' or 'subject') in "type".
                    const type = this.sortType
                    // A small helper function that gets the value we want to compare from a lesson.
                    const value = (lesson) => {
                        // Get the lesson's value for that type. e.g. lesson['price'] gives '£20'.
                        const v = lesson[type]
                        // Prices are text like '£20', so they need special treatment.
                        if (type === 'price') {
                            // Remove everything that is not a number or a dot ('£20' becomes '20'),
                            // then turn it into a real number (20) so we can compare it properly.
                            return parseFloat(String(v).replace(/[^0-9.]/g, ''))
                        } // End of the price check.
                        // For everything else, just give back the value as it is.
                        return v
                    } // End of the value helper.
                    // Make a COPY of the lessons ([...] copies the list) and filter by searchQuery
                    // so searching works instantly on screen even while the server replies.
                    const query = this.searchQuery.trim().toLowerCase()
                    const filtered = query === ''
                        ? [...this.lessons]
                        : this.lessons.filter(lesson =>
                            String(lesson.subject).toLowerCase().includes(query) ||
                            String(lesson.location).toLowerCase().includes(query) ||
                            String(lesson.price).toLowerCase().includes(query) ||
                            String(lesson.availability).toLowerCase().includes(query)
                        )
                    // Now sort the filtered copy.
                    // "a" and "b" are two lessons being compared to each other.
                    const sorted = filtered.sort((a, b) => {
                        // Get the value to compare from the first lesson.
                        const x = value(a)
                        // Get the value to compare from the second lesson.
                        const y = value(b)
                        // If the values are text (like subject or location)...
                        if (typeof x === 'string') {
                            // ...compare them alphabetically (A to Z).
                            return x.localeCompare(y)
                        } // End of the text check.
                        // If they are numbers, subtracting puts them in order from low to high.
                        return x - y
                    }) // End of sort.
                    // If ascending is chosen, give back the list as it is (low to high).
                    // If not, flip the list around (high to low).
                    // "? :" is a short if/else: condition ? ifTrue : ifFalse
                    return this.sortAscending ? sorted : sorted.reverse()
                } // End of sortedLessons.
            } // End of computed.
        // Finish building the app and attach it to the HTML element with id="app".
        }).mount('#app')
