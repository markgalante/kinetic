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
         <div class="row my-3 list-group-item each-comment">
            <div class="d-block">
                <p> <strong>${data.author.username}</strong> | <span class="text-muted">a few seconds ago</span>  <span class="float-right comment-hamburger"><i class="fas fa-bars"></i></span></p>
            </div>
            <div class="current-comment">
                <p>${data.text}</p>  
            </div>
            <form action="${formAction}/${data._id}" method="POST" class="edit-comment">
                <div class="form-row">
                    <div class="form-group col-9 col-sm-10 col-md-11">
                        <textarea rows="1" class="form-control" name="comment[text]">${data.text}</textarea>
                    </div>
                    <div class=" form-group col-3 col-sm-2 col-md-1">
                        <input type="submit" class="btn btn-primary btn-sm edit-submit-button">
                    </div>
                </div>
            </form>
            <div class="comment-option-buttons">
                <button class="btn btn-default btn-sm edit-button user-owner-buttons"><i class="far fa-edit"></i> Edit</button>
                <button type="button" href="#" class="btn btn-danger btn-sm user-owner-buttons" data-toggle="modal" data-target="#deleteComment"><i class="far fa-trash-alt"></i> Delete</button>
                    <div class="modal" id="deleteComment" tabindex="-1" role="dialog" aria-labelledby="deleteComment" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered modal-notify modal-sm modal-danger" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title font-weight-bolder" id="deleteComment">Are you sure?</h5>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Cancel</button>
                                    <form action="${formAction}/${data._id}" method="POST" class="delete-comment">
                                        <input type="submit" class="btn btn-danger btn-sm" value="Delete">
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
        `   
        )
        $('#commentTextArea').val('')
    }); 
}); 

// 2 - Show edit form
$('#commentList').on('click', '.edit-button', function(){
    $(this).parent().siblings('.edit-comment, .current-comment').toggle(); 
});

// Click on each of your own comments to show the edit and delete buttons.
$('#commentList').on('click', '.comment-hamburger', function(){
    $(this).parents('.each-comment').find('.comment-option-buttons').toggle(); 
});


// 3 - Edit comment
$('#commentList').on('submit', '.edit-comment', function(e){
    e.preventDefault(); 
    var editComment = $(this).serialize();
    var actionURL = $(this).attr('action'); 
    $originalComment = $(this).parent('.list-group-item'); 
    $.ajax({
        url: actionURL, 
        data: editComment,
        type: 'PUT', 
        originalComment: $originalComment, 
        success: function(data){
            this.originalComment.html(
                `
                    <div class="d-block">
                        <p> <strong>${data.author.username}</strong> | <span class="text-muted">a few seconds ago</span>  <span class="float-right comment-hamburger"><i class="fas fa-bars"></i></span></p>
                    </div>
                    <div class="current-comment">
                        <p>${data.text}</p>  
                    </div>
                    <form action="${actionURL}" method="POST" class="edit-comment">
                        <div class="form-row">
                            <div class="form-group col-9 col-sm-10 col-md-11">
                                <textarea rows="1" class="form-control" name="comment[text]">${data.text}</textarea>
                            </div>
                            <div class=" form-group col-3 col-sm-2 col-md-1">
                                <input type="submit" class="btn btn-primary btn-sm edit-submit-button">
                            </div>
                        </div>
                    </form>
                    <div class="comment-option-buttons">
                        <button class="btn btn-default btn-sm edit-button user-owner-buttons"><i class="far fa-edit"></i> Edit</button>
                        <button type="button" class="btn btn-danger btn-sm user-owner-buttons" data-toggle="modal" data-target="#deleteComment"><i class="far fa-trash-alt"></i> Delete</button>
                            <div class="modal" href="#" id="deleteComment" tabindex="-1" role="dialog" aria-labelledby="deleteComment" aria-hidden="true">
                                <div class="modal-dialog modal-dialog-centered modal-notify modal-sm modal-danger" role="document">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title font-weight-bolder" id="deleteComment">Are you sure?</h5>
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Cancel</button>
                                            <form action="${actionURL}" method="POST" class="delete-comment">
                                                <input type="submit" class="btn btn-danger btn-sm" value="Delete">
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                </div>
                `
            )
        }
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


//REFERENCES
/* Toggle between showing the edit and delete buttons */
$('#reference-panel').on('click', '.ref-hamburger', function(){
    $(this).parents('.each-reference').find('.reference-author-buttons').toggle(); 
});

/*Toggle to delete reference*/
$('#reference-panel').on('submit', '.reference-delete', function(e){
    e.preventDefault(); 
    var actionURL = $(this).attr('action'); 
    $referenceToDelete = $(this).closest('.list-group-item');
    $.ajax({
        url: actionURL,
        type: 'DELETE',
        referenceToDelete: $referenceToDelete,
        success: function(){
            this.referenceToDelete.remove(); 
            $('.modal-backdrop').remove();
        }
    });
});

//LOADING BUTTONS 
$('.submit-button').click(function(){
    $(this).html(`<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Loading...`)
    .addClass('disabled'); 
});