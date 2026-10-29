document.addEventListener('DOMContentLoaded', () => {
    const questionsContainer = document.getElementById('questions-container');
    const searchBar = document.getElementById('search-bar');
    const expandAllBtn = document.getElementById('expand-all');
    const collapseAllBtn = document.getElementById('collapse-all');
    const questionCountBadge = document.getElementById('question-count');

    let questionsData = [];

    // Fetch the data from the JSON file
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            questionsData = data;
            renderQuestions(questionsData);
            questionCountBadge.textContent = questionsData.length;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            questionsContainer.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">Failed to load questions. Please check if data.json exists and is valid.</div>`;
        });

    // Render questions to the DOM
    function renderQuestions(data) {
        questionsContainer.innerHTML = '';

        if (data.length === 0) {
            questionsContainer.innerHTML = `<div class="p-8 text-center text-gray-500">No questions found matching your search.</div>`;
            return;
        }

        data.forEach(q => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-blue-300 transition-colors';

            // Convert choice strings into HTML list items
            const choicesHtml = q.choices.map(choice => {
                // Check if this choice is part of the correct answer
                // Answers might be multiple (e.g. "2, 3"). We extract digits.
                const correctAnswers = q.answer.split(',').map(a => a.trim());

                // Extract choice number (e.g., "1." -> "1")
                const choiceNumMatch = choice.match(/^(\d+)\./);
                const choiceNum = choiceNumMatch ? choiceNumMatch[1] : null;

                const isCorrect = correctAnswers.includes(choiceNum);

                return `
                    <li class="p-3 rounded-md mb-2 flex items-start gap-3 ${isCorrect ? 'bg-green-50 border border-green-200 text-green-900' : 'bg-gray-50 border border-transparent'}">
                        <span class="font-medium ${isCorrect ? 'text-green-700' : 'text-gray-600'}">${choiceNum}.</span>
                        <span class="flex-grow">${choice.substring(choice.indexOf('.') + 1).trim()}</span>
                        ${isCorrect ? `<svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>` : ''}
                    </li>
                `;
            }).join('');

            card.innerHTML = `
                <button class="w-full text-left px-6 py-5 focus:outline-none flex justify-between items-start gap-4 toggle-btn">
                    <div class="flex gap-4">
                        <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-full text-sm">${q.id}</span>
                        <h3 class="text-lg font-medium text-gray-800 leading-snug mt-1">${q.question}</h3>
                    </div>
                    <svg class="w-6 h-6 text-gray-400 flex-shrink-0 mt-1 chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div class="px-6 pb-6 answer-content">
                    <div class="border-t border-gray-100 pt-4">
                        <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Choices</h4>
                        <ul class="list-none">
                            ${choicesHtml}
                        </ul>
                    </div>
                </div>
            `;

            questionsContainer.appendChild(card);
        });

        // Add event listeners to toggle buttons
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('expanded-btn');
                const content = btn.nextElementSibling;
                content.classList.toggle('expanded');
            });
        });
    }

    // Search functionality
    searchBar.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = questionsData.filter(q =>
            q.question.toLowerCase().includes(term) ||
            q.choices.some(c => c.toLowerCase().includes(term))
        );
        renderQuestions(filtered);
    });

    // Expand all
    expandAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.add('expanded-btn');
            btn.nextElementSibling.classList.add('expanded');
        });
    });

    // Collapse all
    collapseAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('expanded-btn');
            btn.nextElementSibling.classList.remove('expanded');
        });
    });
});