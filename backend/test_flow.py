import json
import urllib.request

BASE = "http://localhost:8000/api"


def post(path, payload):
    url = BASE + path
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req) as res:
            body = res.read().decode()
            print(path, "->", res.status, res.getheader("Content-Type"))
            print(body)
            return json.loads(body)
    except Exception as e:
        try:
            body = e.read().decode()
            print(path, "error", e, body)
        except Exception:
            print(path, "error", e)
        raise


def main():
    # create dummy user OTP and register
    user = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "secret123",
    }
    print("sending OTP")
    post("/send-otp/", user)
    # this script can't read actual OTP; in real run, inspect logs
    otp = input("Paste OTP from logs: ")
    resp = post("/verify-otp/", {"username": user["username"], "email": user["email"], "otp": otp})
    print("verify response", resp)
    # login
    login_res = post("/login/", {"username": user["email"], "email": user["email"], "password": user["password"]})
    print("login result", login_res)

if __name__ == "__main__":
    main()
