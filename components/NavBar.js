document.addEventListener("DOMContentLoaded", () => {
    const navPlaceholder = document.getElementById("nav-wrapper");
    if (!navPlaceholder) return;

    navPlaceholder.innerHTML = `
        <nav class="w-full border-b border-slate-100 bg-white/90 backdrop-blur-md text-slate-800 px-6 py-4 fixed top-0 left-0 z-50 font-sans shadow-sm">
            <div class="max-w-6xl mx-auto flex justify-between items-center">
                <a href="/index.html" class="text-xl font-black tracking-tight text-slate-900 hover:text-indigo-600 transition-colors duration-200">
                    PHAYUK<span class="text-indigo-600">.com</span>
                </a>
                <div class="flex items-center space-x-8 text-sm font-semibold">
                    <a href="/projects" class="text-slate-600 hover:text-indigo-600 transition-colors duration-200">Projects</a>
                    <a href="/awards" class="text-slate-600 hover:text-indigo-600 transition-colors duration-200">Awards</a>
                    <a href="/blogs" class="text-slate-600 hover:text-indigo-600 transition-colors duration-200">Blog</a>
                    <span class="flex items-center space-x-2 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full text-xs text-emerald-700 font-medium">
                        <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Active Now</span>
                    </span>
                </div>
            </div>
        </nav>
        <div class="h-16"></div>
    `;
});