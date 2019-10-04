const axios = require("axios");
const fs = require("fs");

const accts = require("./faves");
const CONFIG_FILE = "./config.json";

const init = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(CONFIG_FILE, (err, data) => {
      if (err) reject(err);

      const config = JSON.parse(data);

      // Check if access token expires soon
      if (config.token_expires < Date.now() + 1000) {
        // Create encoded header parameter
        const clientAuth = config.client_id + ":" + config.client_secret;
        const headerBased = new Buffer(clientAuth).toString("base64");

        // Refresh access token
        axios({
          method: "post",
          url: "https://accounts.spotify.com/api/token",
          params: {
            grant_type: "refresh_token",
            refresh_token: config.refresh_token
          },
          headers: { Authorization: "Basic " + headerBased }
        })
          .then(({ data }) => {
            // Update configuration
            config.access_token = data.access_token;
            config.token_expires = Date.now() + data.expires_in * 1000;
            config.scope = data.scope;
            config.token_type = data.token_type;

            // Write to config file
            const writeData = JSON.stringify(config);
            fs.writeFile(CONFIG_FILE, writeData, err => {
              if (err) console.log("Config file write failed. " + err);
              else console.log("Updated config file");
            });

            resolve(config);
          })
          .catch(err => reject(err));
      } else {
        console.log("Access token is recent.");
        resolve(config);
      }
    });
  });
};

init()
  .then(config => {
    // Blowfish playlists
    getUserPlaylists(config, accts.blowf, 0, 50);
  })
  .catch(err => console.log(`ok what the fuck! ${err}`));

// =========================================================
// ======================== Methods ========================
// =========================================================
const getMe = config => {
  axios
    .get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `${config.token_type} ${config.access_token}`
      }
    })
    .then(({ data }) => console.log(data))
    .catch(err => console.log(`??? ${err}`));
};

const getUserPlaylists = (config, user, offset = 0, limit = 20) => {
  axios
    .get(`https://api.spotify.com/v1/users/${user}/playlists`, {
      headers: {
        Authorization: `${config.token_type} ${config.access_token}`
      },
      params: { limit, offset }
    })
    .then(({ data }) => {

      // WAIT IT'S WRAPPED IN A PAGING OBJECT!!!!!
      // https://developer.spotify.com/documentation/web-api/reference-beta/#endpoint-get-list-users-playlists
      // ok bed time

      if (data.total > limit - offset) {
        
        // don't have all the playlists yet
        console.log(
          `Whoa, there! ${data.total} playlists?? That's too darn many!`
        );
      } else {
        const playlistTrackPromises = data.items.map(playlist =>
          axios.get(playlist.tracks.href, {
            headers: {
              Authorization: `${config.token_type} ${config.access_token}`
            },
            params: {
              limit: 100,
              offset: 0,
              fields: "items(track(name,id,artists))"
            }
          })
        );

        // Promise.all(playlistTrackPromises).then(tracksByPlaylist =>
        //   tracksByPlaylist.reduce((log, { playlist }) => {
        //     for(let i = 0; i < playlist.items.length; i++) {
        //       if (log[playlist.items[i].track]) true;
        //       else
        //     }
        //     return log;
        //   }, {})
        // );
      }
    })
    .catch(err => console.log(`??? ${err}`));
};

p = {
  href:
    "https://api.spotify.com/v1/users/spotify_espa%C3%B1a/playlists/21THa8j9TaSGuXYNBU5tsC/tracks",
  items: [
    {
      added_at: "2016-10-11T13:44:40Z",
      added_by: {
        external_urls: {
          spotify: "http://open.spotify.com/user/spotify_espa%C3%B1a"
        },
        href: "https://api.spotify.com/v1/users/spotify_espa%C3%B1a",
        id: "spotify_españa",
        type: "user",
        uri: "spotify:user:spotify_espa%C3%B1a"
      },
      is_local: false,
      track: {
        album: {
          album_type: "single",
          artists: [
            {
              external_urls: {
                spotify:
                  "https://open.spotify.com/artist/21451j1KhjAiaYKflxBjr1"
              },
              href: "https://api.spotify.com/v1/artists/21451j1KhjAiaYKflxBjr1",
              id: "21451j1KhjAiaYKflxBjr1",
              name: "Zion \u0026 Lennox",
              type: "artist",
              uri: "spotify:artist:21451j1KhjAiaYKflxBjr1"
            }
          ],
          available_markets: [
            "AD",
            "AR",
            "AT",
            "AU",
            "BE",
            "BG",
            "BO",
            "BR",
            "CA",
            "CH",
            "CL",
            "CO",
            "CR",
            "CY",
            "CZ",
            "DE",
            "DK",
            "DO",
            "EC",
            "EE",
            "ES",
            "FI",
            "FR",
            "GB",
            "GR",
            "GT",
            "HK",
            "HN",
            "HU",
            "ID",
            "IE",
            "IS",
            "IT",
            "JP",
            "LI",
            "LT",
            "LU",
            "LV",
            "MC",
            "MT",
            "MX",
            "MY",
            "NI",
            "NL",
            "NO",
            "NZ",
            "PA",
            "PE",
            "PH",
            "PL",
            "PT",
            "PY",
            "SE",
            "SG",
            "SK",
            "SV",
            "TR",
            "TW",
            "UY"
          ],
          external_urls: {
            spotify: "https://open.spotify.com/album/5GjKG3Y8OvSVJO55dQTFyD"
          },
          href: "https://api.spotify.com/v1/albums/5GjKG3Y8OvSVJO55dQTFyD",
          id: "5GjKG3Y8OvSVJO55dQTFyD",
          images: [
            {
              height: 640,
              url:
                "https://i.scdn.co/image/b16064142fcd2bd318b08aab0b93b46e87b1ebf5",
              width: 640
            },
            {
              height: 300,
              url:
                "https://i.scdn.co/image/9f05124de35d807b78563ea2ca69550325081747",
              width: 300
            },
            {
              height: 64,
              url:
                "https://i.scdn.co/image/863c805b580a29c184fc447327e28af5dac9490b",
              width: 64
            }
          ],
          name: "Otra Vez (feat. J Balvin)",
          type: "album",
          uri: "spotify:album:5GjKG3Y8OvSVJO55dQTFyD"
        },
        artists: [
          {
            external_urls: {
              spotify: "https://open.spotify.com/artist/21451j1KhjAiaYKflxBjr1"
            },
            href: "https://api.spotify.com/v1/artists/21451j1KhjAiaYKflxBjr1",
            id: "21451j1KhjAiaYKflxBjr1",
            name: "Zion \u0026 Lennox",
            type: "artist",
            uri: "spotify:artist:21451j1KhjAiaYKflxBjr1"
          },
          {
            external_urls: {
              spotify: "https://open.spotify.com/artist/1vyhD5VmyZ7KMfW5gqLgo5"
            },
            href: "https://api.spotify.com/v1/artists/1vyhD5VmyZ7KMfW5gqLgo5",
            id: "1vyhD5VmyZ7KMfW5gqLgo5",
            name: "J Balvin",
            type: "artist",
            uri: "spotify:artist:1vyhD5VmyZ7KMfW5gqLgo5"
          }
        ],
        available_markets: [
          "AD",
          "AR",
          "AT",
          "AU",
          "BE",
          "BG",
          "BO",
          "BR",
          "CA",
          "CH",
          "CL",
          "CO",
          "CR",
          "CY",
          "CZ",
          "DE",
          "DK",
          "DO",
          "EC",
          "EE",
          "ES",
          "FI",
          "FR",
          "GB",
          "GR",
          "GT",
          "HK",
          "HN",
          "HU",
          "ID",
          "IE",
          "IS",
          "IT",
          "JP",
          "LI",
          "LT",
          "LU",
          "LV",
          "MC",
          "MT",
          "MX",
          "MY",
          "NI",
          "NL",
          "NO",
          "NZ",
          "PA",
          "PE",
          "PH",
          "PL",
          "PT",
          "PY",
          "SE",
          "SG",
          "SK",
          "SV",
          "TR",
          "TW",
          "UY"
        ],
        disc_number: 1,
        duration_ms: 209453,
        explicit: false,
        external_ids: { isrc: "USWL11600423" },
        external_urls: {
          spotify: "https://open.spotify.com/track/7pk3EpFtmsOdj8iUhjmeCM"
        },
        href: "https://api.spotify.com/v1/tracks/7pk3EpFtmsOdj8iUhjmeCM",
        id: "7pk3EpFtmsOdj8iUhjmeCM",
        name: "Otra Vez (feat. J Balvin)",
        popularity: 85,
        preview_url:
          "https://p.scdn.co/mp3-preview/79c8c9edc4f1ced9dbc368f24374421ed0a33005",
        track_number: 1,
        type: "track",
        uri: "spotify:track:7pk3EpFtmsOdj8iUhjmeCM"
      }
    },
    {
      added_at: "2016-10-11T13:44:40Z",
      added_by: {
        external_urls: {
          spotify: "http://open.spotify.com/user/spotify_espa%C3%B1a"
        },
        href: "https://api.spotify.com/v1/users/spotify_espa%C3%B1a",
        id: "spotify_españa",
        type: "user",
        uri: "spotify:user:spotify_espa%C3%B1a"
      },
      is_local: false
    }
  ],
  limit: 100,
  next: null,
  offset: 0,
  previous: null,
  total: 58
};

// fuck = {
//   href: "https://api.spotify.com/v1/users/wizzler/playlists",
//   items: [
//     {
//       collaborative: false,
//       external_urls: {
//         spotify:
//           "http://open.spotify.com/user/wizzler/playlists/53Y8wT46QIMz5H4WQ8O22c"
//       },
//       href:
//         "https://api.spotify.com/v1/users/wizzler/playlists/53Y8wT46QIMz5H4WQ8O22c",
//       id: "53Y8wT46QIMz5H4WQ8O22c",
//       images: [],
//       name: "Wizzlers Big Playlist",
//       owner: {
//         external_urls: { spotify: "http://open.spotify.com/user/wizzler" },
//         href: "https://api.spotify.com/v1/users/wizzler",
//         id: "wizzler",
//         type: "user",
//         uri: "spotify:user:wizzler"
//       },
//       public: true,
//       snapshot_id:
//         "bNLWdmhh+HDsbHzhckXeDC0uyKyg4FjPI/KEsKjAE526usnz2LxwgyBoMShVL+z+",
//       tracks: {
//         href:
//           "https://api.spotify.com/v1/users/wizzler/playlists/53Y8wT46QIMz5H4WQ8O22c/tracks",
//         total: 30
//       },
//       type: "playlist",
//       uri: "spotify:user:wizzler:playlist:53Y8wT46QIMz5H4WQ8O22c"
//     },
//     {
//       collaborative: false,
//       external_urls: {
//         spotify:
//           "http://open.spotify.com/user/wizzlersmate/playlists/1AVZz0mBuGbCEoNRQdYQju"
//       },
//       href:
//         "https://api.spotify.com/v1/users/wizzlersmate/playlists/1AVZz0mBuGbCEoNRQdYQju",
//       id: "1AVZz0mBuGbCEoNRQdYQju",
//       images: [],
//       name: "Another Playlist",
//       owner: {
//         external_urls: { spotify: "http://open.spotify.com/user/wizzlersmate" },
//         href: "https://api.spotify.com/v1/users/wizzlersmate",
//         id: "wizzlersmate",
//         type: "user",
//         uri: "spotify:user:wizzlersmate"
//       },
//       public: true,
//       snapshot_id:
//         "Y0qg/IT5T02DKpw4uQKc/9RUrqQJ07hbTKyEeDRPOo9LU0g0icBrIXwVkHfQZ/aD",
//       tracks: {
//         href:
//           "https://api.spotify.com/v1/users/wizzlersmate/playlists/1AVZz0mBuGbCEoNRQdYQju/tracks",
//         total: 58
//       },
//       type: "playlist",
//       uri: "spotify:user:wizzlersmate:playlist:1AVZz0mBuGbCEoNRQdYQju"
//     }
//   ],
//   limit: 9,
//   next: null,
//   offset: 0,
//   previous: null,
//   total: 9
// };
