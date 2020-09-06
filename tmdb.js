const baseUri = 'http://api.themoviedb.org/3';
const baseImgUri = 'http://image.tmdb.org/t/p';

class PagedResponse {
    /**
     * @param {Object} response The response
     * @param {Number} currentPage The current page
     * @param {Function<PagedResponse>} next Callback that returns the next page. Null if there is no next page.
     */
    constructor(response, currentPage, next) {
        this.response = response;
        if (currentPage < response.total_pages) {
            this.next = next;
        }
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
            new PagedResponse(await r.json(), page, () => {
                return this.getPopular(page + 1);
            })
        );
    }

    /**
     * @param {Number} id The id of the movie to get similar content
     * @param {Number=} page The page number. Minimum of 1.
     * @returns {PagedResponse} The related movies list
     */
    getSimilar(id, page) {
        page = page || 1;

        return this.tmdb.fetch(`/movie/${id}/similar`, {
            page,
        }).then(async r =>
            new PagedResponse(await r.json(), page, () => {
                return this.getSimilar(id, page + 1);
            })
        );
    }

    /**
     * @param {Number} id The id of the movie to get recomendations for
     * @param {Number=} page The page number. Minimum of 1.
     * @returns {PagedResponse} The related movies list
     */
    getRecommended(id, page) {
        page = page || 1;

        return this.tmdb.fetch(`/movie/${id}/recommendations`, {
            page,
        }).then(async r =>
            new PagedResponse(await r.json(), page, () => {
                return this.getRecommended(id, page + 1);
            })
        );
    }

    /**
     * Returns videos of a movie
     * @param {number} id The movie id
     */
    getVideos(id) {
        return this.tmdb.fetch(`/movie/${id}/videos`).then(r => r.json());
    }
}

class TV {
    /**
     * @param {TheMovieDB} tmdb A client to use
     */
    constructor(tmdb) {
        this.tmdb = tmdb;
    }

    /**
     * Returns information about a show
     * @param {Number} id Show id
     */
    getDetails(id) {
        return this.tmdb.fetch(`/tv/${id}`).then(r => r.json());
    }

    /**
     * @param {Number=} page The page number. Minimum of 1.
     * @returns {PagedResponse} The popular shows list
     */
    getPopular(page) {
        page = page || 1;

        return this.tmdb.fetch('/tv/popular', {
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
        this.tv = new TV(this);
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