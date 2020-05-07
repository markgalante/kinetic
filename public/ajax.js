// $('.recommend').submit(function(e){
//     e.preventDefault(); 
//     const formAction = $(this).attr('action'); 
//     $.ajax({
//         url: formAction,
//         type: 'POST', 
//         success: function(data){
//             debugger; 
//         }
//     }); 
// }); 
$('.recommend').submit(function(e){
    e.preventDefault(); 
    const formAction = $(this).attr('action'); 
    $.post(formAction, function(data){
        if($('button').hasClass('recommendBtn')){
            $('button.recommendBtn').toggle(
                function(){$(this)
                .html(` <i class="fas fa-check-circle"></i> Reccommended (${data.recommends.length})`)
                .css('display', 'block')
                .removeClass('btn btn-primary btn-rounded recommend recommendBtn')
                .addClass('btn btn-success btn-rounded recommend recommended')}
            );
        } 
        else if($('button').hasClass('recommended')){
            $('button.recommend').toggle(
                function(){$(this)
                .html(` <i class="far fa-check-circle"></i> Recommend (${data.recommends.length})`)
                .css('display', 'block')
                .removeClass('btn btn-success btn-rounded recommend recommended')
                .addClass('btn btn-primary btn-rounded recommend recommendBtn')} 
            )
        }

    }); 
}); 



$('.comments').submit(function(e){
    e.preventDefault(); 
    const formData = $(this).serialize(); 
    const formAction = $(this).attr('action'); 
    $.post(formAction, formData, function(data){
        console.log(data)
    }); 
}); 