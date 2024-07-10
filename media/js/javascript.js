document.addEventListener('DOMContentLoaded', function () {

    const changePasswordYes = document.getElementById('changePasswordYes');
    const passwordFields = document.getElementById('passwordFields');

    const showPasswordCheckbox = document.getElementById('showPasswordCheckbox');
    const newPasswordField = document.getElementById('newPassword');
    const oldPasswordField = document.getElementById('oldPassword');

    if (showPasswordCheckbox) {
        showPasswordCheckbox.addEventListener('change', function () {
            const isChecked = this.checked;
            if (isChecked) {
                newPasswordField.type = 'text';
                oldPasswordField.type = 'text';
            } else {
                newPasswordField.type = 'password';
                oldPasswordField.type = 'password';
            }
        });
    } 

    if (changePasswordYes) {
        changePasswordYes.addEventListener('change', function () {
            if (this.checked) {
                passwordFields.style.display = 'block';
                newPasswordField.removeAttribute('disabled');
            }
        });
    } 

    const changePasswordNo = document.getElementById('changePasswordNo');

    if (changePasswordNo) {
        changePasswordNo.addEventListener('change', function () {
            if (this.checked) {
                passwordFields.style.display = 'none';
                newPasswordField.setAttribute('disabled', 'disabled');
            }
        });
    } 
});
$(document).ready(function() {

     $(document).on('click', '.delete-contact', function() {
        if (confirm("Are you sure you want to delete this record?")) {
            const contactId = $(this).data('id');
            $.ajax({
                url: '/deleteContact',
                method: 'DELETE',
                data: { id: contactId },
                success: function(response) {
                    addMessage(response.status, response.message);
                    fetchData(); 
                },
                error: function(err) {
                    addMessage("error", 'Error deleting contact');
                }
            });
        }
    });
    $('#deleteSelected').on('click', function(e) {
        e.preventDefault();
        if (confirm("Are you sure you want to delete selected contacts?")) {
            const selectedContacts = $('.submark:checked').map(function() {
                return this.value;
            }).get();

            $.ajax({
                url: '/deleteContacts',
                method: 'DELETE',
                data: { ids: selectedContacts },
                success: function(response) {
                    addMessage(response.status, response.message);
                    fetchData(); 
                },
                error: function(err) {
                    addMessage("error", 'Error deleting contact');
                }
            });
        }
    });
    
    function addMessage(status,message){
        if(status=="error"){
            html =  '<div class="mt-1"> <div class="alert alert-danger" id="dangeralert" role="alert">'+message+'</div> </div>';
        }else{
            html = '<div class="mt-1"><div class="alert alert-success" id="successalert" role="alert">'+message+'</div></div>';
        }
        $("#header").after(html);
        setTimeout(function() {
            $('.alert-success').fadeOut();
            $('.alert-danger').fadeOut();
        }, 10000); 
    }

    function addOrReplaceUrlParameter(key, value) {
        let url = new URL(window.location.href);
        if (url.searchParams.has(key)) {
            url.searchParams.set(key, value); 
        } else {
            url.searchParams.append(key, value); 
        }
        window.history.replaceState({ path: url.href }, '', url.href);
    }
    function getAllUrlParams() {
        var queryParams = new URLSearchParams(window.location.search);
        var params = {};
        queryParams.forEach(function(value, key) {
            params[key] = value;
        });
        return params;
    }
    function removeParameter(key=false) {
        let baseUrl = window.location.href.split('?')[0];
        if(key){
            let params = new URLSearchParams(window.location.search);
            params.delete(key);
            let newUrl = baseUrl + '?' + params.toString();
            history.replaceState(null, '', newUrl);
        }else{
            history.replaceState(null, '', baseUrl);
        }
    }
    // Function to update "Delete Selected" button state
    function updateDeleteButtonState() {
        const anyChecked = $('.submark').is(':checked');
        $('#deleteSelected').prop('disabled', !anyChecked);
    }
    $(document).on('click', "#resetAll", function() {
        removeParameter();
        fetchData();
        $("#resetAll").hide();
    });

    // Event listener for "Select All" checkbox
    $(document).on('change', "#checkAll", function() {
        $('.submark').prop('checked', this.checked);
        updateDeleteButtonState();
    });

    // Event listener for individual checkboxes
    $(document).on('change', ".submark", function() {
        const allChecked = $('.submark').length == $('.submark:checked').length;
        $('#checkAll').prop('checked', allChecked);
        updateDeleteButtonState();
    });

    // Initial state update
    updateDeleteButtonState();
    function fetchData() {
        var params = getAllUrlParams();
        $.ajax({
            url: '/allinone', // The URL of the server endpoint
            method: 'GET',
            data: {
                params
                 // _: new Date().getTime() //for cache remove
            },
            success: function(data) {
                $('#contactsTable').html(data);
                updateDeleteButtonState();

            },
            error: function(err) {
                console.error('Error fetching sorted data:', err);
            }
        });
    }

    $(document).on('click', ".pagination .page-item .page-link", function(e) {
        e.preventDefault(); 
        if ($(this).closest('.page-item').hasClass('active')) {
            return; // Do nothing if the link is already active
        }
        addOrReplaceUrlParameter("page", $(this).data("page"));
        addOrReplaceUrlParameter("limit",$(this).data("limit"));
        fetchData();
        $("#resetAll").show()
    });
    let sortOrder = 'asc'; 
    $(document).on('click', ".sort", function(e) {
        e.preventDefault();
        const field = $(this).data('field');
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        addOrReplaceUrlParameter("sortOrder", sortOrder);
        addOrReplaceUrlParameter("sortField",field);
        fetchData();
        $("#resetAll").show()
    });
    $('#searchForm').on('submit', function(e) {
        e.preventDefault();
        addOrReplaceUrlParameter("searchField", $("#searchField").val());
        addOrReplaceUrlParameter("q", $("#search-q").val());
        fetchData();
        $("#resetAll").show()
    });


});


function confirmLogout() {
	if (confirm("Are you sure you want to logout?") == true) 
		{window.location.href = "/logout"; }
}


function display_ct6() 
{
    var x = new Date()
    var ampm = x.getHours( ) >= 12 ? ' PM' : ' AM';
    hours = x.getHours( ) % 12;
    hours = hours ? hours : 12;
    var x1=x.getMonth() + 1+ "/" + x.getDate() + "/" + x.getFullYear(); 
    x1 = x1 + "  " +  hours + ":" +  x.getMinutes() + ":" +  x.getSeconds() + ":" + ampm;
    document.getElementById('ct6').innerHTML = x1;
    display_c6();
}
function display_c6()
{
    var refresh=1000; // Refresh rate in milli seconds
    mytime=setTimeout('display_ct6()',refresh)
}
display_c6()

$(document).ready(function()
{	
	
	$('#pass').on('change',function(){
      	var isChecked = $(this).prop('checked');
      	if (isChecked) {$('.password').attr('type','text');}
      	else {$('.password').attr('type','Password'); }
    });
    $('#newpass').on('change',function(){
      	var isChecked = $(this).prop('checked');
      	if (isChecked) {$('.new_password').attr('type','text');}
      	else {$('.new_password').attr('type','Password'); }
    });
  	setTimeout(function() {
        $('.alert-success').fadeOut();
        $('.alert-danger').fadeOut();
    }, 10000); 

	$("form").validate(
	{
        rules : 
        {
            username : {
                required : true,
                lettersonly: true,
                minlength : 4 

            },
            email : {
                required : true,
                email: true
            },
            newPassword:{
                required : true,
                rangelength: [7, 15]
            },
            oldPassword:{
                required : true,
                rangelength: [7, 15]
            },
            password : {
            	required : true,
            	rangelength: [7, 15]
            },
            firstname:{
                required : true,
                lettersonly: true,
                minlength : 3 
            },
            lastname:{
                required : true,
                lettersonly: true,
                minlength : 3 
            },
            phone_no:{
                required : true,
                digits: true,
                minlength : 10,
                maxlength : 13
            },
            city:{
                required : true,
                lettersonly: true,
                minlength : 3 
            },
            gender:{
                required : true,
            },
        },
        messages : 
        {
            username :
            {
                required :"Please enter your Name",
                minlength: "Minimum lenth 4"
            },
            password :
            {
            	required : "Please enter a password",
           		rangelength : "Your password is minimum 8 maximum 20"
            }
    	},
		errorElement: "div",
		errorPlacement: function ( error, element ) 
		{
			error.addClass( "invalid-feedback" );
			error.insertAfter( element );
		},
		highlight: function(element) {
	        $(element).removeClass('is-valid').addClass('is-invalid');
	    },
	    unhighlight: function(element) {
	        $(element).removeClass('is-invalid').addClass('is-valid');
	    }
    });
    $("#editForm").validate({
        rules: {
            username: {
                required: true,
                lettersonly: true,
                minlength: 4 
            },
            email: {
                required: true,
                email: true
            },
            newPassword: {
                required: "#changePasswordYes:checked",
                rangelength: [7, 15]
            },
            oldPassword: {
                required: true,
                rangelength: [7, 15]
            }
        },
        messages: {
            username: {
                required: "Please enter your Name",
                minlength: "Minimum length is 4"
            },
            email: {
                required: "Please enter your email",
                email: "Please enter a valid email address"
            },
            newPassword: {
                required: "Please enter a new password",
                rangelength: "Your password must be between 7 and 15 characters long"
            },
            oldPassword: {
                required: "Please enter your old password",
                rangelength: "Your password must be between 7 and 15 characters long"
            }
        },
        errorElement: "div",
        errorPlacement: function(error, element) {
            error.addClass("invalid-feedback");
            error.insertAfter(element);
        },
        highlight: function(element) {
            $(element).removeClass('is-valid').addClass('is-invalid');
        },
        unhighlight: function(element) {
            $(element).removeClass('is-invalid').addClass('is-valid');
        }
    });
	
});	

