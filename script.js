/**
 * PHAYUK Portfolio Main Engine
 * Handles concise homepage content dashboards with image previews
 */

document.addEventListener("DOMContentLoaded", () => {
    renderHomepageProjects();
    renderHomepageAwards();
});

function renderHomepageProjects() {
    const container = document.getElementById("projects");
    if (!container || typeof projectsData === "undefined") return;

    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex justify-between items-end">
                <h2 class="text-2xl font-bold tracking-tight text-slate-900">Featured Builds</h2>
                <a href="projects/index.html" class="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
                    View All Projects →
                </a>
            </div>
            <div id="projects-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
        </div>
    `;

    const grid = document.getElementById("projects-grid");
    // Slice dataset array to show ONLY the first two featured entries on the main page
    const topProjects = projectsData.slice(0, 2);

    grid.innerHTML = topProjects.map(project => `
        <div class="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
                <div class="aspect-video w-full bg-slate-50 border-b border-slate-100 overflow-hidden">
                    <img src="projects/${project.id}/img/1.png" alt="${project.title}" class="w-full h-full object-cover" loading="lazy">
                </div>
                <div class="p-6 space-y-2">
                    <h3 class="text-lg font-bold text-slate-900 tracking-tight pt-1">${project.title}</h3>
                    <p class="text-sm text-slate-500 leading-relaxed">${project.subtitle || project.description}</p>
                </div>
            </div>
            <div class="px-6 pb-6">
                <a href="projects/index.html?id=${project.id}" class="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors inline-block pt-2">
                    View Details →
                </a>
            </div>
        </div>
    `).join('');
}

function renderHomepageAwards() {
    const container = document.getElementById("awards");
    if (!container || typeof awardsData === "undefined") return;

    container.innerHTML = `
        <div class="space-y-6 mt-16">
            <div class="flex justify-between items-end">
                <h2 class="text-2xl font-bold tracking-tight text-slate-900">Recent Milestones</h2>
                <a href="awards/index.html" class="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
                    View All Achievements →
                </a>
            </div>
            <div id="awards-timeline" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
        </div>
    `;

    const timeline = document.getElementById("awards-timeline");
    const topAwards = awardsData.slice(0, 2);

    timeline.innerHTML = topAwards.map(award => `
        <div class="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
                <div class="aspect-video w-full bg-slate-50 border-b border-slate-100 overflow-hidden">
                    <img src="awards/${award.id}/${award.image}" alt="${award.title}" class="w-full h-full object-cover" loading="lazy">
                </div>
                <div class="p-6 space-y-2">
                    <div class="flex justify-between items-start">
                        <span class="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2.5 py-0.5 rounded-full">${award.year}</span>
                        <span class="text-xs font-semibold text-slate-400">${award.organization}</span>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 tracking-tight pt-1">${award.title}</h3>
                    <p class="text-sm text-slate-500 leading-relaxed">${award.summary}</p>
                </div>
            </div>
            <div class="px-6 pb-6">
                <a href="awards/index.html?id=${award.id}" class="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors inline-block pt-2">
                    View Credentials & Details →
                </a>
            </div>
        </div>
    `).join('');
}