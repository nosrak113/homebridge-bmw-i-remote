# homebridge-bmw-connected
Control your locks on your BMW Connected Drive Cars


# config.json

```
{
        "accessory": "BMWConnected",
        "name": "My Car",
        "vin": "ABC123",
        "username": "youremail@domain.com",
        "password": "ABC123",
        "client_id": "abcdef"

}
```

## Configuration Params

|             Parameter            |                       Description                       | Required |
| -------------------------------- | ------------------------------------------------------- |:--------:|
| `name`                           | name of the accessory                                   |     ✓    |
| `vin`                            | vin number of the car                                   |     ✓    |
| `username`                       | username for BMW's Connected Drive service              |     ✓    |
| `password`                       | password for BMW's Connected Drive service              |     ✓    |
| `client_id`                      | ID of Client for BMW's servers                          |     ✓    |


## Basic Auth

This is a fork from the original script written by nosrak113 (homebridge-bmw-i-remote)

These API calls are designed to allow you to interact with your BMW Connected Drive.  They were reverse engineered from [the official BMW Connected Drive Website](https://www.bmw-connecteddrive.com/).

Your use of these API calls is entirely at your own risk.  They are neither officially provided nor sanctioned.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

In order to authenticate against the API you will need to be registered on [BMW's Connected Drive service](https://www.bmw-connecteddrive.com/).

You will need:

1. Your ConnectedDrive registered email address.
2. Your ConnectedDrive registered password.
3. The VIN number of your vehicle
3. The Connected Drive client_id

You can get the client_id details from either decompiling the Android App or from intercepting communications between your phone and the BMW server.  This is left as an exercise for the reader ☺

## Help

  - Make sure to specify all parameters

## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-bmw-connected`
3. Update your config file
