// frontend/assets/js/api.js

// প্রথমে HTML ফাইলে axios CDN যুক্ত করতে হবে।
// <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

const api = axios.create({
    baseURL: 'YOUR_BACKEND_URL_HERE', // <-- খুবই গুরুত্বপূর্ণ: এখানে আপনার ব্যাকএন্ডের URL বসাতে হবে
    timeout: 10000, // 10 সেকেন্ড
    headers: {
        'Content-Type': 'application/json',
    }
});

// প্রতিটি রিকোয়েস্টের সাথে টেলিগ্রামের initData পাঠানোর জন্য একটি ইন্টারসেপ্টর
api.interceptors.request.use(config => {
    if (window.Telegram && Telegram.WebApp) {
        // config.headers['Authorization'] = `Bearer ${Telegram.WebApp.initData}`;
        // অথবা বডিতে পাঠানো যেতে পারে
        if (config.method === 'post' || config.method === 'put') {
            if(config.data){
                 config.data.initData = Telegram.WebApp.initData;
            } else {
                 config.data = { initData: Telegram.WebApp.initData };
            }
        }
    }
    return config;
}, error => {
    return Promise.reject(error);
});
