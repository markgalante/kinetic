//ASYNCHRONOUS RECOMMENDING AND UNRECOMMEND 
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


//COMMENTS:
// 1 - Adding comment
$('.comments').submit(function(e){
    e.preventDefault(); 
    const formData = $(this).serialize(); 
    const formAction = $(this).attr('action'); 
    $.post(formAction, formData, function(data){ 
        $('#commentList').append(      
         `
            <div class="row my-3 list-group-item">
                <div style="width: 100%; text-align: left;">
                    <a href="${formAction}/${data._id}/edit" class="btn btn-default btn-sm">Edit Comment</a>
                    <button type="button" class="btn btn-danger btn-sm" data-toggle="modal" data-target="#deleteComment">Delete</button>
                    
                    <div class="modal" id="deleteComment" tabindex="-1" role="dialog" aria-labelledby="deleteComment" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered modal-notify modal-sm modal-danger" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                       <h5 class="modal-title" id="deleteComment">Are you sure?</h5>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                                    <form action="${formAction}/${data._id}" method="POST" class="delete-comment">
                                        <input type="submit" class="btn btn-danger btn-sm" value="Delete">
                                    </form>
                               </div>
                            </div>
                        </div>
                    </div>

                    <h5 class="float-left"> <strong>${data.author.username}</strong></h5><br>
                    <p class="text-muted" class="date">a few seconds ago</p>
                </div>
                <div style="width: 100%; text-align: left;">
                    <p>${data.text}</p>  
                </div>
            </div>
         `   
        )
        $('#commentTextArea').val('')
    }); 
}); 

// 4 - Delete comment: 
$('#commentList').on('submit', '.delete-comment', function(e){
    e.preventDefault(); 
    var actionURL = $(this).attr('action'); 
    $commentToDelete = $(this).closest('.list-group-item'); 
    $.ajax({
        url: actionURL, 
        type: 'DELETE', 
        commentToDelete: $commentToDelete,
        success: function(){
            this.commentToDelete.remove(); 
            $('.modal-backdrop').remove();
        }
    });
});