function confirmLogout() {
	if (confirm("Are you sure you want to logout?") == true) 
		{window.location.href = "/logout"; }
}
function confirmdelete(id){
	var del=confirm("Are you sure you want to delete this record?");
	if (del==true)
        {window.location.href="/deleteContact?id="+id; }
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
	// $(".dltall").prop("disabled",true);
	// $("input:checkbox").click(function(){
	// 	if($(this).is (":checked"))
	// 	{	$(".dltall").prop("disabled",false); }
	// 	else
	// 	{
	// 		if($(".mark").filter("checked").length < 1)
	// 		{$(".dltall").prop("disabled",true); }
	// 	}
	// }); 	 
	// $("#checkAl").click(function () {	 
	// 	$('input:checkbox').attr('checked',true );
	// 	$('input:checkbox').not(this).prop('checked', this.checked);
	// });
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
 //  	$("#successalert").fadeTo(1000, 500).slideUp(500, function(){
 //    	$("#successalert").slideUp(500);
	// });

	// $("#login").validate(
	// {
    //     rules : 
    //     {
    //         username :
    //         { 
    //             required : true,
    //             minlength : 4 

    //         },
    //         password :
    //         {
    //         	required : true,
    //         	rangelength: [7, 15]
            	
    //         }
    //     },
    //     messages : 
    //     {
    //         username :
    //         {
    //             required :"Please enter your Name",
    //             minlength: "minimum lenth 4"
    //         },
    //         password :
    //         {
    //         	required : "Please enter a password",
    //        		rangelength : "your password is minimum 8 maximum 20"
    //         }
    // 	},
	// 	errorElement: "div",
	// 	errorPlacement: function ( error, element ) 
	// 	{
	// 		error.addClass( "invalid-feedback" );
	// 		error.insertAfter( element );
	// 	},
	// 	highlight: function(element) {
	//         $(element).removeClass('is-valid').addClass('is-invalid');
	//     },
	//     unhighlight: function(element) {
	//         $(element).removeClass('is-invalid').addClass('is-valid');
	//     }
    // });
	// $("#dltadmin").validate(
	// {
    //     rules : 
    //     {
    //         username :
    //         { 
    //             required : true,
    //             minlength : 4 
 
    //         },
    //         password :
    //         {
    //         	required : true,
    //         	rangelength: [7, 15]
            	
    //         }
    //     },
    //     messages : 
    //     {
    //         username :
    //         {
    //             required :"Please enter your Userame",
    //             minlength: "minimum lenth 4"
    //         },
    //         password :
    //         {
    //         	required : "Please enter a password",
    //        		rangelength : "your password is minimum 8 maximum 20"
    //         }
    // 	},
	// 	errorElement: "div",
	// 	errorPlacement: function ( error, element ) 
	// 	{
	// 		error.addClass( "invalid-feedback" );
	// 		error.insertAfter( element );
	// 	},
	// 	highlight: function(element) {
	//         $(element).removeClass('is-valid').addClass('is-invalid');
	//     },
	//     unhighlight: function(element) {
	//         $(element).removeClass('is-invalid').addClass('is-valid');
	//     }
    // });
    // $("#edit").validate(
	// {
    //     rules : 
    //     {
    //         username :
    //         { 
    //             required : true,
    //             minlength : 4 
    //         },
    //         password :
    //         {
    //         	required : true,
    //         	rangelength: [7, 15]	
    //         },
    //         newpassword :
    //         {
    //         	required : true,
    //         	rangelength: [7, 15]	
    //         },
    //         name :
    //         {
    //         	required : true,
    //         	minlength : 3
    //         },
    //         email :
    //         {
    //         	required : true,
    //         	email: true
    //         }
    //     },
    //     messages : 
    //     {
    //         username :
    //         {
    //             required :"Please enter your Name",
    //         	minlength : "you name is minimum 3 charaters"

    //         },
    //         password :
    //         {
    //         	required : "Please enter a password",
    //        		rangelength : "your password is minimum 8 maximum 20"
    //         },
    //         newpassword :
    //         {
    //         	required : "Please enter a New password",
    //        		rangelength : "your password is minimum 8 maximum 20"
    //         },
    //         name :
    //         {
    //         	required : "Please enter a name",
    //         	minlength : "you name is minimum 3 charaters"
    //         },
    //         email :
    //         {
    //         	required : "Please enter a email",
    //         	email : "your email is not prefect"
    //         }

    // 	},
	// 	errorElement: "div",
	// 	errorPlacement: function ( error, element ) 
	// 	{
	// 		error.addClass( "invalid-feedback" );
	// 		error.insertAfter( element );
	// 	},
	// 	highlight: function(element) {
	//         $(element).removeClass('is-valid').addClass('is-invalid');
	//     },
	//     unhighlight: function(element) {
	//         $(element).removeClass('is-invalid').addClass('is-valid');
	//     }
	// });
	// $("#add_edit").validate(
	// {
    //     rules : 
    //     {
    //         name :
    //         { 
    //             required : true,
    //             minlength : 3 
    //         },
    //         ph :
    //         {
    //         	required : true,
    //     	   	number: true,
    //         	rangelength: [10, 10]	
    //         },
    //         em :
    //         {
    //         	required : true,
    //         	email: true
    //         },
    //         city :
    //         {
    //         	required : true,
    //         	lettersonly: true,
    //             minlength : 3 
    //         },
    //         address :
    //         {
    //         	alphanumeric : true,
    //         	required : true,
    //         }
    //     },
    //     messages : 
    //     {
    //         name :
    //         {
    //             required :"Please enter your Name",
    //         	minlength : "you name is minimum 3 charaters"

    //         },
    //         ph :
    //         {
    //         	required : "Please enter a phone number",
    //         	number : "only number",
    //        		rangelength : "your phone number is 10 digits "
    //         },
    //         city :
    //         {
    //         	required : "Please enter a city",
    //         	minlength : "you name is minimum 3 charaters",
    //         	lettersonly: "only letter"
    //         },
    //         em :
    //         {
    //         	required : "Please enter a email",
    //         	email : "your email is not prefect"
    //         },
    //         address :
    //         {
    //         	required : "Please enter a address",
    //         	alphanumeric :"alphanumeric "
    //         }
    
        
    // 	},
	// 	errorElement: "div",
	// 	errorPlacement: function ( error, element ) 
	// 	{
	// 		error.addClass( "invalid-feedback" );
	// 		error.insertAfter( element );
	// 	},
	// 	highlight: function(element) {
	//         $(element).removeClass('is-valid').addClass('is-invalid');
	//     },
	//     unhighlight: function(element) {
	//         $(element).removeClass('is-invalid').addClass('is-valid');
	//     }
	// });

});	
// $(document).ready(function()
//         {
//             $("#register").validate(
//             {
//                 rules : 
//                 {
//                     username :
//                     { 
//                         required : true,
//                         minlength : 4 
//                     },
//                     password :
//                     {
//                         required : true,
//                         rangelength: [7, 15]    
//                     },
//                     name :
//                     {
//                         required : true,
//                         minlength : 3
//                     },
//                     email :
//                     {
//                         required : true,
//                         email: true
//                     }
//                 },
//                 messages : 
//                 {
//                     username :
//                     {
//                         required :"Please enter your Name",
//                         minlength : "you name is minimum 3 charaters"

//                     },
//                     password :
//                     {
//                         required : "Please enter a password",
//                         rangelength : "your password is minimum 8 maximum 20"
//                     },
//                     name :
//                     {
//                         required : "Please enter a name",
//                         minlength : "you name is minimum 3 charaters"
//                     },
//                     email :
//                     {
//                         required : "Please enter a email",
//                         email : "your email is not prefect"
//                     }

//                 },
//                 errorElement: "div",
//                 errorPlacement: function ( error, element ) 
//                 {
//                     error.addClass( "invalid-feedback" );
//                     error.insertAfter( element );
//                 },
//                 highlight: function(element) {
//                     $(element).removeClass('is-valid').addClass('is-invalid');
//                 },
//                 unhighlight: function(element) {
//                     $(element).removeClass('is-invalid').addClass('is-valid');
//                 }
//             });
//         });