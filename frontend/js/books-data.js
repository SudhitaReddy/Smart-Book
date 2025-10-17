// Mock book data with actual stock photos
const booksData = {
    fiction: [
        {
            id: 1,
            title: "The Midnight Garden",
            author: "Sarah Mitchell",
            price: 599,
            originalPrice: 699,
            rating: 4.8,
            reviews: 156,
            category: "Fiction",
            image: "https://pixabay.com/get/g89204dc728ef3db5f4c6546dd340389fa4f0eb34caa8bd75717add0058786c076be1b0e7c7206d82354c8da4ffbc6600d08bcfeda8cbf7b9cd8e83c5498d959a_1280.jpg",
            isNew: true,
            isFeatured: true,
            isBestSeller: false
        },
        {
            id: 2,
            title: "Chronicles of Tomorrow",
            author: "Michael Chen",
            price: 450,
            rating: 4.6,
            reviews: 89,
            category: "Fiction",
            image: "https://pixabay.com/get/gfa5cd5482256b9f7d87ef7f8f8fd9bc2c13b3a5d9382c1ccaaf16e9f661579df39a8678a6886034d03e8faa934b494c888beef94206af8a80187e2a87ecf6fad_1280.jpg",
            isNew: true,
            isFeatured: false,
            isBestSeller: true
        },
        {
            id: 3,
            title: "Whispers in the Dark",
            author: "Emma Johnson",
            price: 375,
            rating: 4.9,
            reviews: 234,
            category: "Fiction",
            image: "https://pixabay.com/get/g9225f2512b82105be81cba36281b86274fafb6f3e32ceeb8c751f71b2b9653392d602cc0311ceaafea1e06765299bc3f6bf524bf9a92bf6b395db41cc196a124_1280.jpg",
            isNew: false,
            isFeatured: true,
            isBestSeller: true
        },
        {
            id: 4,
            title: "The Lost Symphony",
            author: "David Rodriguez",
            price: 525,
            rating: 4.4,
            reviews: 67,
            category: "Fiction",
            image: "https://pixabay.com/get/gfd8869aa3bebb6907fbaeb0a331f646afaaa173b22e27f3036d26688ddda9e63f33a0fa8c4f05d5b88c4a63aa2a278ab81f94510541cc134016e033e4a28a9d1_1280.jpg",
            isNew: true,
            isFeatured: false,
            isBestSeller: false
        },
        {
            id: 5,
            title: "Beyond the Horizon",
            author: "Lisa Park",
            price: 425,
            rating: 4.7,
            reviews: 145,
            category: "Fiction",
            image: "https://pixabay.com/get/ge8e0f98ce953aa1093e990e61140a04e304e7e952195dd87cc73e8e2f5432c1b1f8672c7c1f4487039144626c41b08723cfb2c49a6567303c9269b1bc0ccf653_1280.jpg",
            isNew: false,
            isFeatured: true,
            isBestSeller: false
        },
        {
            id: 6,
            title: "Echoes of Yesterday",
            author: "James Wilson",
            price: 350,
            originalPrice: 400,
            rating: 4.5,
            reviews: 78,
            category: "Fiction",
            image: "https://pixabay.com/get/g22453e4144d85c2b22bffff58b1ade82f0a010967ee7db6c062e5322320e3bbec7bf74b077fbb92c576ea5c9a542ff14620db533fb0973b11aac3185ac068820_1280.jpg",
            isNew: false,
            isFeatured: false,
            isBestSeller: true
        },
        {
            id: 7,
            title: "Whispers in the Wind",
            author: "Emma Carter",
            price: 280,
            rating: 4.2,
            reviews: 56,
            category: "Fiction",
            image: "https://pixabay.com/get/g5a80821a7f6545845f8e3f37ac5e3c6296277b0939009ac7cb633dd4dc5dd2fc47340b55d5f847c12b1c3b9cea40e31b3119ad58b3c724223ebd49eadc776ce4_1280.jpg",
            isNew: true,
            isFeatured: false,
            isBestSeller: false
        },
        {
            id: 8,
            title: "The Forgotten Path",
            author: "Daniel Harris",
            price: 400,
            rating: 4.7,
            reviews: 112,
            category: "Fiction",
            image: "https://pixabay.com/get/gfd8d117ee0d4e24064b60004cf5dea8afdee1160ad5a8f7a22a2b1b9fcb1944e5b6b76642791b8f8c31074ddcfdd5e03da522e2c93b2eaf709c23ad999ee7eca_1280.jpg",
            isNew: false,
            isFeatured: true,
            isBestSeller: true
        },
            {
                id: 9,
                title: "Whispers of the Night",
                author: "Emma Carter",
                price: 320,
                rating: 4.2,
                reviews: 56,
                category: "Fiction",
                image: "https://picsum.photos/200/300?random=1",
                isNew: true,
                isFeatured: false,
                isBestSeller: true
            },
        {
            id: 10,
            title: "Echoes of Yesterday",
            author: "James Wilson",
            price: 350,
            rating: 4.5,
            reviews: 78,
            category: "Fiction",
            image: "https://picsum.photos/200/300?random=2",
            isNew: false,
            isFeatured: false,
            isBestSeller: true
        },
        {
            id: 11,
            title: "Dancing with Dreams",
            author: "Isabella Brown",
            price: 280,
            rating: 4.0,
            reviews: 40,
            category: "Fiction",
            image: "https://picsum.photos/200/300?random=3",
            isNew: true,
            isFeatured: false,
            isBestSeller: false
        },
        {
            id: 12,
            title: "The Broken Compass",
            author: "Liam Harris",
            price: 390,
            rating: 4.6,
            reviews: 120,
            category: "Fiction",
            image: "https://picsum.photos/200/300?random=4",
            isNew: false,
            isFeatured: true,
            isBestSeller: true
        },
        {
            id: 13,
            title: "Tides of Time",
            author: "Sophia Turner",
            price: 310,
            rating: 4.1,
            reviews: 65,
            category: "Fiction",
            image: "https://picsum.photos/200/300?random=5",
            isNew: true,
            isFeatured: false,
            isBestSeller: false
        },
        {
            id: 14,
            title: "The Silent Garden",
            author: "Oliver Scott",
            price: 450,
            rating: 4.7,
            reviews: 150,
            category: "Fiction",
            image: "https://picsum.photos/200/300?random=6",
            isNew: false,
            isFeatured: true,
            isBestSeller: true
        },
        {
            id: 15,
            title: "Lost Horizons",
            author: "Charlotte Green",
            price: 280,
            rating: 3.9,
            reviews: 44,
            category: "Fiction",
            image: "https://picsum.photos/200/300?random=7",
            isNew: true,
            isFeatured: false,
            isBestSeller: false
        },
        {
            id: 16,
            title: "Winds of Fate",
            author: "Benjamin Hall",
            price: 370,
            rating: 4.3,
            reviews: 90,
            category: "Fiction",
            image: "https://picsum.photos/200/300?random=8",
            isNew: false,
            isFeatured: true,
            isBestSeller: true
        },
        {
            id: 17,
            title: "The Forgotten Tale",
            author: "Amelia White",
            price: 300,
            rating: 4.0,
            reviews: 55,
            category: "Fiction",
            image: "https://picsum.photos/200/300?random=9",
            isNew: true,
            isFeatured: false,
            isBestSeller: false
        },
        {
            id: 18,
            title: "Shadows of Eternity",
            author: "Ethan Young",
            price: 480,
            rating: 4.8,
            reviews: 180,
            category: "Fiction",
            image: "https://picsum.photos/200/300?random=10",
            isNew: false,
            isFeatured: true,
            isBestSeller: true
        }
    ],
    nonFiction: [
        {
            id: 19,
            title: "The Science of Success",
            author: "Dr. Amanda Foster",
            price: 675,
            rating: 4.9,
            reviews: 289,
            category: "Non-Fiction",
            image: "https://pixabay.com/get/g62d5ffac0b545bf392ed175768a6c3588aa1361760ebf9a60946668b29cd9e01717b762ea75c6738db00cdce05f2531364ac3e5aedded2b041b374beb399f1f4_1280.jpg",
            isNew: false,
            isFeatured: true,
            isBestSeller: true
        },
        {
            id: 820,
            title: "Mindful Leadership",
            author: "Robert Kumar",
            price: 550,
            rating: 4.6,
            reviews: 134,
            category: "Non-Fiction",
            image: "https://pixabay.com/get/g5a80821a7f6545845f8e3f37ac5e3c6296277b0939009ac7cb633dd4dc5dd2fc47340b55d5f847c12b1c3b9cea40e31b3119ad58b3c724223ebd49eadc776ce4_1280.jpg",
            isNew: true,
            isFeatured: false,
            isBestSeller: false
        },
        {
            id: 21,
            title: "Digital Revolution",
            author: "Tech Insights",
            price: 799,
            rating: 4.8,
            reviews: 156,
            category: "Non-Fiction",
            image: "https://pixabay.com/get/gfd8d117ee0d4e24064b60004cf5dea8afdee1160ad5a8f7a22a2b1b9fcb1944e5b6b76642791b8f8c31074ddcfdd5e03da522e2c93b2eaf709c23ad999ee7eca_1280.jpg",
            isNew: true,
            isFeatured: true,
            isBestSeller: false
        },
        {
            id: 22,
            title: "The Art of Innovation",
            author: "Creative Minds",
            price: 475,
            rating: 4.4,
            reviews: 92,
            category: "Non-Fiction",
            image: "https://pixabay.com/get/ge43a7a73d0ac8c0e057fa3c0878d55ce8342cb06896e36f1afc76e08a592d17edda37897350d02a5d986d29be5d3ea7d7bfb1b7c0f3dcb1dddaa15c92a7bf013_1280.jpg",
            isNew: false,
            isFeatured: false,
            isBestSeller: true
        },
        {
            id: 23,
            title: "Psychology of Success",
            author: "Dr. Michael Rivers",
            price: 625,
            rating: 4.9,
            reviews: 312,
            category: "Non-Fiction",
            image: "https://pixabay.com/get/g9fb7a9f47bc3df99e46b843338eaaea50adc3ca046b7e30368fef6eeeb8e0b10dfeac97e19e85592154921bdcc03efe10d6f4f3e155454d5158ff3b00220c610_1280.jpg",
            isNew: true,
            isFeatured: true,
            isBestSeller: true
        },
        {
            id: 24,
            title: "Global Economics Today",
            author: "Finance Institute",
            price: 750,
            rating: 4.6,
            reviews: 178,
            category: "Non-Fiction",
            image: "https://pixabay.com/get/g12526aba349b9b2d62a57fc8d9d8875a6abfd7c788b7b15d8df54565bf0c6ed25558fd20336caa346854c4dcb7ed2d372875df8a4cbd4e8c8d13b7a73e9eeec3_1280.jpg",
            isNew: true,
            isFeatured: false,
            isBestSeller: false
        },
        {
            id: 25,
            title: "Healthy Living Guide",
            author: "Dr. Sarah Johnson",
            price: 525,
            rating: 4.7,
            reviews: 203,
            category: "Non-Fiction",
            image: "https://pixabay.com/get/g89c220ed6ea243c7d7da0c77266ebe2fde04a95b7f76ff30dc80c4d47b649cfe357eedaf62cec7f31676b586f4b6c943edcb59bbe3ffc358f14918eac0e188d5_1280.jpg",
            isNew: false,
            isFeatured: true,
            isBestSeller: true
        },
            {
        id: 26,
        title: "The Art of Simplicity",
        author: "Daniel Roberts",
        price: 400,
        rating: 4.5,
        reviews: 110,
        category: "Non-Fiction",
        image: "https://picsum.photos/200/300?random=11",
        isNew: false,
        isFeatured: true,
        isBestSeller: true
    },
    {
        id: 27,
        title: "Mindset Matters",
        author: "Sophia Adams",
        price: 320,
        rating: 4.3,
        reviews: 85,
        category: "Non-Fiction",
        image: "https://picsum.photos/200/300?random=12",
        isNew: true,
        isFeatured: false,
        isBestSeller: false
    },
    {
        id: 28,
        title: "History Unfolded",
        author: "Michael King",
        price: 450,
        rating: 4.7,
        reviews: 130,
        category: "Non-Fiction",
        image: "https://picsum.photos/200/300?random=13",
        isNew: false,
        isFeatured: true,
        isBestSeller: true
    },
    {
        id: 29,
        title: "The Power of Habits",
        author: "Lily Brown",
        price: 310,
        rating: 4.2,
        reviews: 72,
        category: "Non-Fiction",
        image: "https://picsum.photos/200/300?random=14",
        isNew: true,
        isFeatured: false,
        isBestSeller: false
    },
    {
        id: 30,
        title: "Journey of Success",
        author: "William Evans",
        price: 390,
        rating: 4.4,
        reviews: 100,
        category: "Non-Fiction",
        image: "https://picsum.photos/200/300?random=15",
        isNew: false,
        isFeatured: true,
        isBestSeller: true
    },
    {
        id: 31,
        title: "Life Lessons",
        author: "Isabella Lewis",
        price: 270,
        rating: 4.0,
        reviews: 60,
        category: "Non-Fiction",
        image: "https://picsum.photos/200/300?random=16",
        isNew: true,
        isFeatured: false,
        isBestSeller: false
    },
    {
        id: 32,
        title: "Hidden Truths",
        author: "Jack Miller",
        price: 420,
        rating: 4.6,
        reviews: 140,
        category: "Non-Fiction",
        image: "https://picsum.photos/200/300?random=17",
        isNew: false,
        isFeatured: true,
        isBestSeller: true
    },
    {
        id: 33,
        title: "World at a Glance",
        author: "Olivia Clark",
        price: 300,
        rating: 4.1,
        reviews: 78,
        category: "Non-Fiction",
        image: "https://picsum.photos/200/300?random=18",
        isNew: true,
        isFeatured: false,
        isBestSeller: false
    },
    {
        id: 34,
        title: "Secrets of the Mind",
        author: "Henry Wright",
        price: 460,
        rating: 4.8,
        reviews: 160,
        category: "Non-Fiction",
        image: "https://picsum.photos/200/300?random=19",
        isNew: false,
        isFeatured: true,
        isBestSeller: true
    },
    {
        id: 35,
        title: "The Wisdom Path",
        author: "Ava Mitchell",
        price: 340,
        rating: 4.2,
        reviews: 92,
        category: "Non-Fiction",
        image: "https://picsum.photos/200/300?random=20",
        isNew: true,
        isFeatured: false,
        isBestSeller: false
    }
    ],
    education: [
        {
            id: 36,
            title: "Advanced Mathematics",
            author: "Prof. Sarah Williams",
            price: 850,
            rating: 4.7,
            reviews: 203,
            category: "Education",
            image: "https://pixabay.com/get/gf1f28596b5c358f04d4ed09c3dab49836a48b8c0e6546b8463c90035daabf018723dc552b4e6ac2412af259395d3f7ce60f1177630a5225d57eca91206adf0e6_1280.jpg",
            isNew: false,
            isFeatured: true,
            isBestSeller: true
        },
        {
            id: 37,
            title: "Computer Science Fundamentals",
            author: "Dr. Raj Patel",
            price: 725,
            rating: 4.8,
            reviews: 178,
            category: "Education",
            image: "https://pixabay.com/get/g9fb7a9f47bc3df99e46b843338eaaea50adc3ca046b7e30368fef6eeeb8e0b10dfeac97e19e85592154921bdcc03efe10d6f4f3e155454d5158ff3b00220c610_1280.jpg",
            isNew: true,
            isFeatured: false,
            isBestSeller: false
        },
        {
            id: 38,
            title: "Physics for Engineers",
            author: "Engineering Academy",
            price: 650,
            originalPrice: 750,
            rating: 4.5,
            reviews: 127,
            category: "Education",
            image: "https://pixabay.com/get/g12526aba349b9b2d62a57fc8d9d8875a6abfd7c788b7b15d8df54565bf0c6ed25558fd20336caa346854c4dcb7ed2d372875df8a4cbd4e8c8d13b7a73e9eeec3_1280.jpg",
            isNew: false,
            isFeatured: true,
            isBestSeller: false
        },
        {
            id: 39,
            title: "English Literature Guide",
            author: "Literary Scholars",
            price: 425,
            rating: 4.6,
            reviews: 156,
            category: "Education",
            image: "https://pixabay.com/get/g89c220ed6ea243c7d7da0c77266ebe2fde04a95b7f76ff30dc80c4d47b649cfe357eedaf62cec7f31676b586f4b6c943edcb59bbe3ffc358f14918eac0e188d5_1280.jpg",
            isNew: true,
            isFeatured: false,
            isBestSeller: true
        },
        {
            id: 40,
            title: "Data Science Mastery",
            author: "Prof. Anna Schmidt",
            price: 895,
            rating: 4.8,
            reviews: 267,
            category: "Education",
            image: "https://pixabay.com/get/g89204dc728ef3db5f4c6546dd340389fa4f0eb34caa8bd75717add0058786c076be1b0e7c7206d82354c8da4ffbc6600d08bcfeda8cbf7b9cd8e83c5498d959a_1280.jpg",
            isNew: true,
            isFeatured: true,
            isBestSeller: false
        },
        {
            id: 41,
            title: "Modern Chemistry",
            author: "Science Academy",
            price: 775,
            originalPrice: 825,
            rating: 4.5,
            reviews: 189,
            category: "Education",
            image: "https://pixabay.com/get/gfa5cd5482256b9f7d87ef7f8f8fd9bc2c13b3a5d9382c1ccaaf16e9f661579df39a8678a6886034d03e8faa934b494c888beef94206af8a80187e2a87ecf6fad_1280.jpg",
            isNew: true,
            isFeatured: false,
            isBestSeller: true
        },
        {
            id: 42,
            title: "Business Management",
            author: "MBA Institute",
            price: 695,
            rating: 4.7,
            reviews: 234,
            category: "Education",
            image: "https://pixabay.com/get/g9225f2512b82105be81cba36281b86274fafb6f3e32ceeb8c751f71b2b9653392d602cc0311ceaafea1e06765299bc3f6bf524bf9a92bf6b395db41cc196a124_1280.jpg",
            isNew: false,
            isFeatured: true,
            isBestSeller: true
        },
        {
            id: 43,
            title: "Digital Marketing Pro",
            author: "Marketing Experts",
            price: 545,
            rating: 4.6,
            reviews: 178,
            category: "Education",
            image: "https://pixabay.com/get/gfd8869aa3bebb6907fbaeb0a331f646afaaa173b22e27f3036d26688ddda9e63f33a0fa8c4f05d5b88c4a63aa2a278ab81f94510541cc134016e033e4a28a9d1_1280.jpg",
            isNew: true,
            isFeatured: false,
            isBestSeller: false
        },
            {
        id: 44,
        title: "Learning Python",
        author: "Mark Richardson",
        price: 500,
        rating: 4.9,
        reviews: 210,
        category: "Education",
        image: "https://picsum.photos/200/300?random=21",
        isNew: false,
        isFeatured: true,
        isBestSeller: true
    },
    {
        id: 45,
        title: "Mastering Data Science",
        author: "Emily Johnson",
        price: 460,
        rating: 4.7,
        reviews: 180,
        category: "Education",
        image: "https://picsum.photos/200/300?random=22",
        isNew: false,
        isFeatured: true,
        isBestSeller: true
    },
    {
        id: 46,
        title: "Introduction to AI",
        author: "Noah Smith",
        price: 420,
        rating: 4.5,
        reviews: 150,
        category: "Education",
        image: "https://picsum.photos/200/300?random=23",
        isNew: true,
        isFeatured: false,
        isBestSeller: false
    },
    {
        id: 47,
        title: "Web Development Basics",
        author: "Sophia Carter",
        price: 350,
        rating: 4.3,
        reviews: 110,
        category: "Education",
        image: "https://picsum.photos/200/300?random=24",
        isNew: true,
        isFeatured: false,
        isBestSeller: true
    },
    {
        id: 48,
        title: "Fundamentals of Networking",
        author: "William Brown",
        price: 370,
        rating: 4.4,
        reviews: 95,
        category: "Education",
        image: "https://picsum.photos/200/300?random=25",
        isNew: true,
        isFeatured: false,
        isBestSeller: false
    },
    {
        id: 49,
        title: "Digital Electronics Made Easy",
        author: "Charlotte Evans",
        price: 310,
        rating: 4.2,
        reviews: 80,
        category: "Education",
        image: "https://picsum.photos/200/300?random=26",
        isNew: true,
        isFeatured: false,
        isBestSeller: false
    },
    {
        id: 50,
        title: "Mathematics for Engineers",
        author: "James Allen",
        price: 480,
        rating: 4.8,
        reviews: 200,
        category: "Education",
        image: "https://picsum.photos/200/300?random=27",
        isNew: false,
        isFeatured: true,
        isBestSeller: true
    },
    {
        id: 51,
        title: "Machine Learning in Practice",
        author: "Olivia Davis",
        price: 450,
        rating: 4.6,
        reviews: 140,
        category: "Education",
        image: "https://picsum.photos/200/300?random=28",
        isNew: false,
        isFeatured: true,
        isBestSeller: true
    },
    {
        id: 52,
        title: "Database Management Systems",
        author: "Benjamin Walker",
        price: 400,
        rating: 4.5,
        reviews: 120,
        category: "Education",
        image: "https://picsum.photos/200/300?random=29",
        isNew: false,
        isFeatured: false,
        isBestSeller: false
    },
    {
        id: 53,
        title: "Cloud Computing Essentials",
        author: "Ava Green",
        price: 370,
        rating: 4.4,
        reviews: 100,
        category: "Education",
        image: "https://picsum.photos/200/300?random=30",
        isNew: true,
        isFeatured: false,
        isBestSeller: true
    }
    ]
};




// Function to get all books
function getAllBooks() {
    return [...booksData.fiction, ...booksData.nonFiction, ...booksData.education];
}

// Function to get books by category
function getBooksByCategory(category) {
    switch(category.toLowerCase()) {
        case 'fiction':
            return booksData.fiction;
        case 'non-fiction':
        case 'nonfiction':
            return booksData.nonFiction;
        case 'education':
            return booksData.education;
        default:
            return getAllBooks();
    }
}

// Function to get top rated books
function getTopRatedBooks(limit = 5) {
    const allBooks = getAllBooks();
    return allBooks
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
}

// Function to get unique books for each tab to avoid repetition
function getUniqueTabBooks() {
    const allBooks = getAllBooks();
    const usedBooks = new Set();
    
    // Priority 1: Featured books (highest priority)
    const featured = allBooks.filter(book => book.isFeatured && !usedBooks.has(book.id));
    featured.forEach(book => usedBooks.add(book.id));
    
    // Priority 2: Best sellers (excluding already used books)
    const bestSellers = allBooks.filter(book => book.isBestSeller && !usedBooks.has(book.id));
    bestSellers.forEach(book => usedBooks.add(book.id));
    
    // Priority 3: New arrivals (excluding already used books)
    const newArrivals = allBooks.filter(book => book.isNew && !usedBooks.has(book.id));
    newArrivals.forEach(book => usedBooks.add(book.id));
    
    // If we need more books for any category, fill with remaining books
    const remainingBooks = allBooks.filter(book => !usedBooks.has(book.id));
    
    return {
        featured: featured.slice(0, 8),
        bestSellers: bestSellers.slice(0, 8),
        newArrivals: newArrivals.slice(0, 8),
        remaining: remainingBooks
    };
}

// Function to get new arrivals (unique books)
function getNewArrivals(limit = 8) {
    const { newArrivals, remaining } = getUniqueTabBooks();
    const result = [...newArrivals];
    
    // Fill remaining slots with other books if needed
    if (result.length < limit) {
        const needed = limit - result.length;
        result.push(...remaining.slice(0, needed));
    }
    
    return result.slice(0, limit);
}

// Function to get featured products (unique books)
function getFeaturedProducts(limit = 8) {
    const { featured, remaining } = getUniqueTabBooks();
    const result = [...featured];
    
    // Fill remaining slots with other books if needed
    if (result.length < limit) {
        const needed = limit - result.length;
        result.push(...remaining.slice(0, needed));
    }
    
    return result.slice(0, limit);
}

// Function to get best sellers (unique books)
function getBestSellers(limit = 8) {
    const { bestSellers, remaining } = getUniqueTabBooks();
    const result = [...bestSellers];
    
    // Fill remaining slots with other books if needed
    if (result.length < limit) {
        const needed = limit - result.length;
        result.push(...remaining.slice(0, needed));
    }
    
    return result.slice(0, limit);
}

// Function to search books
function searchBooks(query) {
    const allBooks = getAllBooks();
    const lowercaseQuery = query.toLowerCase();
    
    return allBooks.filter(book => 
        book.title.toLowerCase().includes(lowercaseQuery) ||
        book.author.toLowerCase().includes(lowercaseQuery) ||
        book.category.toLowerCase().includes(lowercaseQuery)
    );
}

// Function to format price in Indian Rupees
function formatPrice(price) {
    return `₹${price.toLocaleString('en-IN')}`;
}

// Function to generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star star"></i>';
    }
    
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt star"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star star"></i>';
    }
    
    return starsHTML;
}
