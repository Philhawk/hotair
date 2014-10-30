$(document).ready(function() {
	$('body').on('click', '#new_login_path', showLogin);
	$('body').on('click', '#new_user_path', showRegister);
  $('body').on('click', '#register_button', showRegister);
  $('body').on('click', '#about_us', showAboutUs);
});

var showLogin = function () {
	// reveal the modal that contains the new room form
	$('#newLoginModal').foundation('reveal', 'open');
};

var showRegister = function () {
	// reveal the modal that contains the new room form
	$('#RegisterModal').foundation('reveal', 'open');
};

var showAboutUs = function () {
	$('#aboutUsModal').foundation('reveal', 'open');
};