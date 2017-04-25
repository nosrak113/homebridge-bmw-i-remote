# homebridge-bmw-i-remote
Control your locks on your BMW I Cars


# config.json

```
{
        "accessory": "BMWIRemote",
        "name": "My Car",
        "vin": "ABC123",
        "username": "youremail@domain.com",
        "password": "ABC123",
        "authbasic": "ABC123==",
        "defaultState": "lock",

}
```

## Configuration Params

|             Parameter            |                       Description                       | Required |
| -------------------------------- | ------------------------------------------------------- |:--------:|
| `name`                           | name of the accessory                                   |     ✓    |
| `vin`                            | vin number of the car                                   |     ✓    |
| `username`                       | username for BMW's Connected Drive service              |     ✓    |
| `password`                       | password for BMW's Connected Drive service              |     ✓    |
| `authbasic`                      | Basic Auth for BMW's oAuth2 servers                     |     ✓    |
| `defaultState`                   | Assume the car is locked on startup                     |     ✓    |


## Basic Auth
These API calls are designed to allow you to interact with your BMW i3.  They were reverse engineered from [the official BMW i Remote Android app](https://play.google.com/store/apps/details?id=com.bmwi.remote).

Your use of these API calls is entirely at your own risk.  They are neither officially provided nor sanctioned.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

In order to authenticate against the API you will need to be registered on [BMW's Connected Drive service](https://connecteddrive.bmwusa.com/cdp/release/internet/servlet/login).

You will need:

1. Your ConnectedDrive registered email address.
1. Your ConnectedDrive registered password.
1. The i Remote API Key.
1. The i Remote API Secret.

You can get the i Remote details from either decompiling the Android App or from intercepting communications between your phone and the BMW server.  This is left as an exercise for the reader ☺

Firstly, we use [Basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication).  That means taking the API Key and Secret and Base64 encoding them.

So `key:secret` becomes `a2V5OnNlY3JldA==`

Use this in the authbasic Parameter.
See [edent/BMW-i-Remote](https://github.com/edent/BMW-i-Remote) for more info


## Help

  - Make sure to specify all parameters

## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-bmw-i-remote`
3. Update your config file
