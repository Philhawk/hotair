	

$(document).ready(function() {
	$('body').on('click', '#new_login_path', showLogin);
	$('body').on('click', '#new_user_path', showRegister);
	$('body').on('click', '#registerButton', showRegister);

});

var showLogin = function () {
	// reveal the modal that contains the new room form
	$('#newLoginModal').foundation('reveal', 'open');
};


var showRegister = function () {
	// reveal the modal that contains the new room form
	$('#RegisterModal').foundation('reveal', 'open');
};


var closeLoginPage = function () {	
	$('#newLoginModal').foundation('reveal', 'close');
};