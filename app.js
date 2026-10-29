document.addEventListener('DOMContentLoaded', () => {
    const questionsContainer = document.getElementById('questions-container');
    const searchBar = document.getElementById('search-bar');
    const expandAllBtn = document.getElementById('expand-all');
    const collapseAllBtn = document.getElementById('collapse-all');
    const questionCountBadge = document.getElementById('question-count');
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    // Check user preference on load
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        lightIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        darkIcon.classList.remove('hidden');
    }

    themeToggleBtn.addEventListener('click', function() {
        darkIcon.classList.toggle('hidden');
        lightIcon.classList.toggle('hidden');

        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    });

    // Scroll to Top Logic
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.remove('opacity-0', 'invisible');
            scrollToTopBtn.classList.add('opacity-100', 'visible');
        } else {
            scrollToTopBtn.classList.add('opacity-0', 'invisible');
            scrollToTopBtn.classList.remove('opacity-100', 'visible');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    let questionsData = [];

    // Fetch the data from the JSON file
    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            questionsData = data;
            renderQuestions(questionsData);
            questionCountBadge.textContent = questionsData.length;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            questionsContainer.innerHTML = `<div class="p-6 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">Failed to load questions. Please check if data.json exists and is valid.</div>`;
        });

    // Utility: Highlight search term safely
    function highlightText(text, term) {
        if (!term) return text;
        const regex = new RegExp(`(${term.replace(/[.*+?^$\\{}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi');
        return text.replace(regex, `<span class="highlight">$1</span>`);
    }

    // Render questions to the DOM
    function renderQuestions(data, searchTerm = "") {
        questionsContainer.innerHTML = '';

        if (data.length === 0) {
            questionsContainer.innerHTML = `
                <div class="p-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-lg">No questions found matching your search.</p>
                </div>`;
            return;
        }

        data.forEach(q => {
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200';

            const correctAnswers = q.answer.split(',').map(a => a.trim());

            // Convert choice strings into HTML list items
            const choicesHtml = q.choices.map(choice => {
                const choiceNumMatch = choice.match(/^(\d+)\./);
                const choiceNum = choiceNumMatch ? choiceNumMatch[1] : null;
                const isCorrect = correctAnswers.includes(choiceNum);

                // Highlight text if searchTerm exists
                let choiceText = choice.substring(choice.indexOf('.') + 1).trim();
                choiceText = highlightText(choiceText, searchTerm);

                // Styling logic based on correctness
                let liClass = "p-3.5 rounded-lg mb-3 flex items-start gap-3 border ";
                let numClass = "font-semibold ";
                let svgIcon = "";

                if (isCorrect) {
                    liClass += "bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50 text-green-900 dark:text-green-300";
                    numClass += "text-green-700 dark:text-green-400";
                    svgIcon = `<svg class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
                } else {
                    liClass += "bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700/50 text-gray-700 dark:text-gray-300";
                    numClass += "text-gray-500 dark:text-gray-400";
                }

                return `
                    <li class="${liClass}">
                        <span class="${numClass} min-w-[1.25rem]">${choiceNum}.</span>
                        <span class="flex-grow leading-relaxed">${choiceText}</span>
                        ${svgIcon}
                    </li>
                `;
            }).join('');

            const highlightedQuestion = highlightText(q.question, searchTerm);

            card.innerHTML = `
                <button class="w-full text-left px-6 py-5 focus:outline-none flex justify-between items-start gap-4 toggle-btn" aria-expanded="false">
                    <div class="flex gap-4">
                        <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold rounded-full text-sm">${q.id}</span>
                        <h3 class="text-lg font-medium text-gray-800 dark:text-gray-100 leading-relaxed mt-0.5">${highlightedQuestion}</h3>
                    </div>
                    <svg class="w-6 h-6 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1 chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div class="px-6 pb-6 answer-content">
                    <div class="border-t border-gray-100 dark:border-gray-700 pt-5">
                        <h4 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Choices</h4>
                        <ul class="list-none m-0 p-0">
                            ${choicesHtml}
                        </ul>
                    </div>
                </div>
            `;

            questionsContainer.appendChild(card);
        });

        // Toggle Expand/Collapse Handlers
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const isExpanded = btn.classList.toggle('expanded-btn');
                btn.setAttribute('aria-expanded', isExpanded);
                const content = btn.nextElementSibling;
                content.classList.toggle('expanded');
            });
        });
    }

    // Search functionality with debounce
    let searchTimeout;
    searchBar.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const term = e.target.value.toLowerCase().trim();

        searchTimeout = setTimeout(() => {
            if (!term) {
                renderQuestions(questionsData);
            } else {
                const filtered = questionsData.filter(q =>
                    q.question.toLowerCase().includes(term) ||
                    q.choices.some(c => c.toLowerCase().includes(term))
                );
                renderQuestions(filtered, term);
            }
        }, 150);
    });

    // Expand all
    expandAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.add('expanded-btn');
            btn.setAttribute('aria-expanded', 'true');
            btn.nextElementSibling.classList.add('expanded');
        });
    });

    // Collapse all
    collapseAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('expanded-btn');
            btn.setAttribute('aria-expanded', 'false');
            btn.nextElementSibling.classList.remove('expanded');
        });
    });
});