document.addEventListener("DOMContentLoaded", () => {
    const footerPlaceholder = document.getElementById("footer-wrapper");
    if (!footerPlaceholder) return;

    footerPlaceholder.innerHTML = `
        <footer class="w-full border-t border-slate-100 bg-slate-50 text-slate-600 px-6 py-12 mt-20 font-sans text-sm">
            <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div class="space-y-3">
                    <p class="text-slate-900 font-bold text-lg">Pholl Chanphayuk</p>
                    <p class="text-slate-500 leading-relaxed max-w-sm">
                        Building functional, intelligent hardware solutions. Always optimizing, tracking new tech milestones, and creating out in the open.
                    </p>
                    <p class="text-xs text-slate-400 pt-4">© 2026 Pholl Chanphayuk. All rights reserved.</p>
                </div>
                <div class="flex justify-end">
                    <div class="w-full max-w-sm bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
                        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        <div class="flex items-center space-x-4">
                            <img src="/assets/me.png" alt="Pholl" class="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 object-cover shadow-sm">
                            <div class="space-y-0.5">
                                <h4 class="text-slate-900 font-bold text-base tracking-tight">Pholl Chanphayuk</h4>
                                <p class="text-xs text-indigo-600 font-bold tracking-wide uppercase">System Integrator & Builder</p>
                                <div class="pt-2 space-y-0.5 text-xs text-slate-500">
                                    <p><span class="font-semibold text-slate-400">Based in:</span> Phnom Penh, KH</p>
                                    <p><span class="font-semibold text-slate-400">Email:</span> <a href="mailto:phayuk@phayuk.com" class="text-indigo-600 hover:underline">phayuk@phayuk.com</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    `;
});