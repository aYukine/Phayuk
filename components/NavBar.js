document.addEventListener("DOMContentLoaded", () => {
    const navPlaceholder = document.getElementById("nav-wrapper");
    if (!navPlaceholder) return;

    navPlaceholder.innerHTML = `
        <nav class="w-full border-b border-slate-100 bg-white/90 backdrop-blur-md text-slate-800 px-4 md:px-6 py-4 fixed top-0 left-0 z-50 font-sans shadow-sm">
            <div class="max-w-6xl mx-auto flex justify-between items-center">
                
                <!-- Brand Identity Header -->
                <a href="/index.html" class="text-xl font-black tracking-tight text-slate-900 hover:text-indigo-600 transition-colors duration-200">
                    PHAYUK<span class="text-indigo-600">.com</span>
                </a>
                
                <!-- Streamlined Navigation Links -->
                <div class="flex items-center space-x-5 sm:space-x-8 text-sm font-semibold">
                    <a href="/projects/index.html" class="text-slate-600 hover:text-indigo-600 transition-colors duration-200">Projects</a>
                    <a href="/awards/index.html" class="text-slate-600 hover:text-indigo-600 transition-colors duration-200">Awards</a>
                    <a href="/blogs/index.html" class="text-slate-600 hover:text-indigo-600 transition-colors duration-200">Blog</a>
                </div>
                
            </div>
        </nav>
        <!-- Standard fixed offset spacer height -->
        <div class="h-16"></div>
    `;
});