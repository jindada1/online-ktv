
var loginBtn = document.getElementById('login-btn');
var signBtn = document.getElementById('sign-btn');
var inputName = document.getElementById('input-name');
var inputPassword = document.getElementById('input-password');


bindEvent(signBtn, 'click', signup);
bindEvent(loginBtn, 'click', clicklogin);
bindEvent(inputName, 'keyup', submit);
bindEvent(inputPassword, 'keyup', submit);


function signup(event) {
    if (check()) {
        var username = inputName.value;
        $.ajax({
            type: "POST",
            url: '/sign',
            data: {
                'username': username,
                'password': inputPassword.value
            },
            success: function (data, textStatus, jQxhr) {
                // console.log(data['status']);
                switch (data['status']) {
                    case 'OK':
                        setCookie(username, username);
                        location.href = '/';
                        break;

                    case 'RT':
                        alert('retry');
                        break;

                    case 'DP':
                        alert('aready registered！');
                        break;

                    default:
                        break;
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log('errorThrown');
            },
            dataType: 'json'
        });
    }
};

function submit(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        if (check()) {
            _login(inputName.value, inputPassword.value);
        }
    }
};

function clicklogin(event) {
    if (check()) {
        _login(inputName.value, inputPassword.value);
    }
}

function check() {
    if (inputName.value == "") {
        alert('请输入用户名');
        return false;
    }
    if (inputPassword.value == "") {
        alert('请输入密码');
        return false;
    }
    return true
}

function _login(username, password) {
    $.ajax({
        type: "POST",
        url: '/login',
        data: {
            'username': username,
            'password': password
        },
        success: function (data, textStatus, jQxhr) {
            switch (data['status']) {
                case 'OK':
                    setCookie(username, username);
                    location.href = '/';
                    break;

                case 'RT':
                    alert('retry');
                    break;

                case 'WR':
                    alert('password wrong！');
                    break;

                default:
                    break;
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log('errorThrown');
        },
        dataType: 'json'
    });
}

function setCookie(username, userid, randomkey = null) {
    Cookies.set('UserName', username);
    Cookies.set('NickName', userid);
    // Cookies.set('RandomKey', randomkey);
}

function bindEvent(dom, eventName, fun) {
    if (window.addEventListener) {
        dom.addEventListener(eventName, fun);
    } else {
        dom.attachEvent('on' + eventName, fun);
    }
}