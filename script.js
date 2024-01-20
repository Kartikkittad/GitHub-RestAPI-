const perPage = 10;
let currentPage = 1;
const username = 'johnpapa';

$(document).ready(function () {
    getUserDetails();

    $('#pagination').on('click', 'a', function (event) {
        event.preventDefault();
        const page = parseInt($(this).data('page'));
        if (page && page !== currentPage) {
            currentPage = page;
            getUserDetails();
        }
    });
});

function getUserDetails() {
    const apiUrl = `https://api.github.com/users/${username}`;

    $.ajax({
        url: apiUrl,
        method: 'GET',
        success: function (userData, status) {
            if (status === 'success') {
                displayUserProfile(userData);
                getRepositories();
            } else {
                console.error('Failed to fetch user details');
            }
        },
        error: function (error) {
            console.error('Error fetching user details:', error.statusText);
        }
    });
}

function getRepositories() {
    const searchQuery = $('#searchInput').val() || '';
    const apiUrl = `https://api.github.com/search/repositories?q=${searchQuery}+user:${username}&page=${currentPage}&per_page=${perPage}`;

    $('#loader').show();

    $.ajax({
        url: apiUrl,
        method: 'GET',
        success: function (data, status) {
            if (status === 'success') {
                if (data.items && data.items.length > 0) {
                    displayRepositories(data.items);
                    displayPagination(Math.ceil(data.total_count / perPage));
                } else {
                    displayError('No repositories found for the provided username.');
                }
            } else {
                console.error('Failed to fetch repositories');
                displayError('Error fetching repositories. Please try again later.');
            }
        },
        error: function (error) {
            console.error('Error fetching repositories:', error.statusText);
            displayError('Username not found. Refresh the page.');
        },
        complete: function () {
            $('#loader').hide();
        }
    });
}
function displayUserProfile(userData) {
    const profilePicUrl = userData.avatar_url;
    const name = userData.name || 'Name not provided';
    const location = userData.location || 'Location not specified';
    const followers = userData.followers || 0;
    const githubLink = userData.html_url || '#';

    $.ajax({
        url: userData.url,
        method: 'GET',
        success: function (completeUserData) {
            const bio = completeUserData.bio || 'No bio available';
            const twitterLink = getTwitterLinkFromBio(bio);

            const profileHtml = `
                <div class="profile">
                <a href="${githubLink}">
                    <img  src="${profilePicUrl}" alt="Profile Picture" style="border-radius: 50%;">
                    </a>
                    <span style="display: flex; flex-direction: column">
                        <h1>${name}</h1>
                        <p>
                        <svg class="Icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#000000" d="M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4l0 0 0 0 0 0 0 0 .3-.3c.3-.3 .7-.7 1.3-1.4c1.1-1.2 2.8-3.1 4.9-5.7c4.1-5 9.6-12.4 15.2-21.6c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208z"/></svg>
                        ${bio}</p>
                        <p><svg class="Icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#000000" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
                        ${location}</p>
                        <p><svg class="Icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#000000" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>
                        ${followers}</p>
                        <p>
                        <svg class="Icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#000000" d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg>
                        ${twitterLink ? `<a href="${twitterLink}" target="_blank">${twitterLink}</a>` : 'Not available'}</p>
                    </span>
                </div>
            `;
            $('#profile').html(profileHtml);
        },
        error: function (error) {
            console.error('Error fetching complete user profile:', error.statusText);
        }
    });
}

function getTwitterLinkFromBio(bio) {
    const twitterRegex = /https?:\/\/twitter\.com\/\w+/;

    const match = bio.match(twitterRegex);
    return match ? match[0] : null;
}


function parseSocialLinksFromBio(bio) {
    const socialLinks = [];
    const regex = /(https?:\/\/[^\s]+)/g;

    let match;
    while ((match = regex.exec(bio)) !== null) {
        if (isSocialMediaLink(match[0])) {
            socialLinks.push(`<a href="${match[0]}" target="_blank">${match[0]}</a>`);
        }
    }

    return socialLinks;
}

function isSocialMediaLink(url) {
    return /twitter\.com/.test(url) || /linkedin\.com/.test(url);
}

function displayError(message) {
    const reposList = $('#reposList');
    reposList.empty();

    const errorHtml = `<p class="error">${message}</p>`;
    reposList.append(errorHtml);
    const pagination = $('#pagination');
    pagination.empty();

    $('#reposList').css({
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
    });
}

const displayPagination = function (totalPages) {
    const pagination = $('#pagination');
    pagination.empty();

    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        const pageHtml = `<a href="#" data-page="${i}" class="${activeClass}">${i}</a>`;
        pagination.append(pageHtml);
    }
};

function displayRepositories(repositories) {
    const reposList = $('#reposList');
    reposList.empty();

    repositories.forEach(repository => {
        const { name, description, html_url, languages_url } = repository;

        $.ajax({
            url: languages_url,
            method: 'GET',
            success: function (languages) {
                const languagesList = Object.keys(languages);

                const repoHtml = `
                    <div class="repository" onclick="window.location.href='${html_url}'">
                        <h2>${name}</h2>
                        <p>${description || 'No description available.'}</p>
                        <p><strong>Languages:</strong><br> <span class="language">${languagesList.join('</span>, <span class="language">') || 'N/A'}</span></p>
                    </div>
                `;

                reposList.append(repoHtml);
            },
            error: function (error) {
                console.error('Error fetching languages:', error.statusText);
            }
        });
    });
}
