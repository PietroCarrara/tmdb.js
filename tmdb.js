const baseUri = 'http://api.themoviedb.org/3';
const baseImgUri = 'http://image.tmdb.org/t/p';

class PagedResponse {
    /**
     * @param {Object} response The response
     * @param {Function<PagedResponse>} next Callback that returns the next page. Null if there is no next page.
     */
    constructor(response, next) {
        this.response = response;
        this.next = next;
    }
}

class Common {

    /**
     * @param {TheMovieDB} tmdb A client to use
     */
    constructor(tmdb) {
        this.tmdb = tmdb;
    }

    /**
     * @param {string} relative Relative url to the image
     * @param {string} size A tmdb size (w500, w342...)
     */
    getImageUrl(relative, size) {
        if (!relative.startsWith('/')) {
            relative = '/' + relative;
        }

        return `${baseImgUri}/${size}${relative}`;
    }
}

class Movie {

    /**
     * @param {TheMovieDB} tmdb A client to use
     */
    constructor(tmdb) {
        this.tmdb = tmdb;
    }

    /**
     * Returns information about a movie
     * @param {number} id The movie id
     */
    getDetails(id) {
        return this.tmdb.fetch(`/movie/${id}`).then(r => r.json());
    }

    /**
     * @param {Number=} page The page number. Minimum of 1.
     * @returns {PagedResponse} The popular movies list
     */
    getPopular(page) {
        page = page || 1;

        return this.tmdb.fetch('/movie/popular', {
            page,
        }).then(async r =>
            new PagedResponse(await r.json(), () => {
                return this.getPopular(page + 1);
            })
        );
    }
}

export default class TheMovieDB {
    /**
     * Creates a new API client
     * @param {string} key Your API key
     */
    constructor(key, lang) {
        this.key = key;
        this.lang = lang || 'en-US';

        this.common = new Common(this);
        this.movie = new Movie(this);
    }

    /**
     * Make a request to the API
     * @param {string} path Relative API endpoit
     * @param {Object} queryParams Query parameters in the form {'key': 'value'}
     * @param {string} method Http method to use
     * @param {*} body Request body
     */
    fetch(path, queryParams, method, body) {
        method = method || 'GET';
        queryParams = queryParams || {};

        queryParams.api_key = this.key;

        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // query parameters
        var params = Object.entries(queryParams)
        .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
        .join('&');

        return window.fetch(baseUri + path + '?' + params, {
            method,
            body,
        });
    }
}