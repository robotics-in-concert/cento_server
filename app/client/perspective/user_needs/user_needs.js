Template.user_needs.helpers({

  'filesToAttach': function(){
    Session.setDefault('filesToAttach', []);
    return Session.get('filesToAttach');
  },


  'users': function(){
    return Meteor.users.find({'services.github': {$exists: true}}).fetch();
    // return Meteor.users.find({});
  }
});

Template.user_needs.rendered = function(){

  $('.modal .add_group').click(function(){
    var $s = $(this).closest('form').find('select');
    var title = $(this).closest('form').find('input[name=group_title]').val();

    $s.append('<option>'+title+'</option>');
    $(this).closest('form').find('input[name=group_title]').val('');
    return false;
  });
};

Template.user_needs.events({
  'dragenter .dropzone': function(){
    $('.dropzone').addClass('dragenter');
    $('.dropmask').show();
    return false;
  },
  'dragleave .dropmask': function(){
    $('.dropzone').removeClass('dragenter');
    $('.dropmask').hide();
    return false;

  },
  'dragover .dropzone': function(e){
    e.preventDefault();
    return false;
  },
  'drop .dropmask': function(e){
    $('.dropmask').hide();
    if (e.preventDefault) {
      e.preventDefault();
    }
    if(e.originalEvent.dataTransfer.files){
      var files = Session.get('filesToAttach');
      _.each(e.originalEvent.dataTransfer.files, function(f){
        files.push(f);
        Meteor.saveFile(f);
      });
      Session.set('filesToAttach', files);
    }
    $('.dropzone').removeClass('dragenter');
    $('.dropmask').hide();
    return false;
  },
  'blur .body': function(e){
    var $e = $(e.target);
    Cento.WorkItems.update({_id:this._id}, {$set:{body: $e.html()}});

  },

  'click .delete_post': function(){
    Cento.WorkItems.remove({_id: this._id});
  },
  'click .upvote_post': function(){
    Cento.WorkItems.update({_id: this._id}, {$inc: {votes:1}});
  },
  'click .downvote_post': function(){
    Cento.WorkItems.update({_id: this._id}, {$inc: {votes:-1}});
  },
  'click .btn.post': function(e){
    var f = $(e.target).closest('form');
    var txt = $('textarea').val();
    var files = Session.get('filesToAttach');
    var attachments = _.map(files, function(f){
      return _.pick(f, 'name', 'size', 'type');
    });

    
    try{
      Cento.WorkItems.insert({
        type: Cento.WorkItemTypes.USER_NEEDS,
        work_group_id: this.currentWorkGroup._id,
        user_id: Meteor.userId(),
        title: txt,
        body: txt,
        created:new Date(),
        votes: 0,
        attachments: attachments
      });

      if(files && files.length > 0){
        Meteor.saveFile(files[0], console.log);
      }
      f[0].reset();
      alertify.success('Successfully created.');
    }catch(e){
      console.error(e.message);
      console.trace(e);
    }
    return false;
  },
  'click .create_task': function(e){
    console.log('xxx');
    var ideation_id = this._id;
    // $('#modal-'+ideation_id).find('select').select2().on('change', function(e){
      // $(this).data("selected", e.val.join());
    // });
      
    $('#modal-'+ideation_id).modal();

    return false;
  },

  'click .create_solution': function(e){
    var ideation = this;
    var f = $(e.target).closest('form');
    var modal = $(e.target).closest('.modal');
    var title = f.find('input[name=title]').val();
    var description = f.find('textarea').val();

    var sid = Cento.Solutions.insert({
      solution_id: this.solution_id,
      related: [
        {
          related_work_id: ideation._id,
          type: 'reference'
        }
      ],
      user_id: Meteor.userId(),
      title: title,
      description: description,
      created:new Date()
    });



    f.find('select option').each(function(){
      Cento.WorkGroups.insert({solution_id: sid, title: $(this).text()});

    });

    modal.modal('hide');
    return false;


  }


});