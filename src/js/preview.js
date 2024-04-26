/**
 * Fetch global header and add it to every html file
 */
fetch('../../../templates/header.html')
    .then(response => {
        if(!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(html => {
        const headerContainer = document.querySelector('.placeholder-header');
        headerContainer.innerHTML = html;
    })
    .catch(err => {
        console.error('There was a problem fetching the header:', err);
    });