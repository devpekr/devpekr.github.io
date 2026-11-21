(function () {
    document.querySelectorAll('[data-portal-listing]').forEach(function (listing) {
        var form = listing.querySelector('[data-list-filter]');
        var input = form && form.querySelector('input[type="search"]');
        var rows = Array.prototype.slice.call(listing.querySelectorAll('[data-list-row]'));
        var count = listing.querySelector('[data-list-count]');
        var empty = listing.querySelector('[data-list-empty]');
        var pagination = listing.querySelector('[data-list-pagination]');
        var pageStatus = listing.querySelector('[data-list-page]');
        var previous = listing.querySelector('[data-list-prev]');
        var next = listing.querySelector('[data-list-next]');
        var pageSize = parseInt(listing.dataset.pageSize, 10) || 0;
        var page = 0;
        var matches = rows;

        function render() {
            var query = input ? input.value.trim().toLocaleLowerCase() : '';
            matches = rows.filter(function (row) {
                var haystack = (row.dataset.search || row.textContent).toLocaleLowerCase();
                return haystack.indexOf(query) !== -1;
            });

            var pageCount = pageSize ? Math.max(1, Math.ceil(matches.length / pageSize)) : 1;
            page = Math.min(page, pageCount - 1);
            var visible = pageSize ? matches.slice(page * pageSize, (page + 1) * pageSize) : matches;
            rows.forEach(function (row) { row.hidden = visible.indexOf(row) === -1; });

            if (count) count.textContent = String(matches.length);
            if (empty) empty.hidden = matches.length !== 0;
            if (pagination) pagination.hidden = matches.length === 0 || pageSize === 0 || pageCount <= 1;
            if (pageStatus) pageStatus.textContent = (page + 1) + ' / ' + pageCount;
            if (previous) previous.disabled = page === 0;
            if (next) next.disabled = page >= pageCount - 1;
        }

        if (form) form.addEventListener('submit', function (event) {
            event.preventDefault();
            page = 0;
            render();
        });
        if (input) input.addEventListener('input', function () {
            page = 0;
            render();
        });
        if (previous) previous.addEventListener('click', function () {
            if (page > 0) { page--; render(); }
        });
        if (next) next.addEventListener('click', function () {
            if ((page + 1) * pageSize < matches.length) { page++; render(); }
        });
        render();
    });
}());
