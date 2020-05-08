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
        $('#commentList').append(      
         `
         <div style="width: 100%; text-align: left;">
                    <a href="${formAction}/${data.id}/edit" class="btn btn-default btn-sm">Edit Comment</a>
                    <form action="${formAction}/${data.id} method="POST">
                        <input type="submit" class="btn btn-danger btn-sm" value="Delete">
                    </form>
                <h5 class="float-left"> <strong>${data.author.username}</strong></h5><br>
                <p class="text-muted" class="date">Posted a moment ago</p>
            </div>
            <div style="width: 100%; text-align: left;">
                <p>${data.text}</p>  
            </div>
         `   
        )
        $('#commentTextArea').val('')
    }); 
}); 