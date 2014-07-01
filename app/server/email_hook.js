
Cento.WorkItems.find({}).observe({
  // added: function(doc){
    // console.log('ADDDED........');
  // },
  changed: function(newDoc, oldDoc){
    var a = 0, b = 0;
    
    if(oldDoc.comments) a = oldDoc.comments.length;
    if(newDoc.comments) b = newDoc.comments.length;

    if(a === b)
      return;


    var lastComment = _.last(newDoc.comments)

    var subs = newDoc.subscribers;
    console.log(subs);
    subs = _.reject(subs, function(uid){ return uid == lastComment.user_id; });
    console.log(subs);

    var solution = Cento.Solutions.findOne({_id: newDoc.solution_id});
    var currentLogin = Meteor.users.findOne({_id: lastComment.user_id}).profile.login;
    subs.forEach(function(uid){
      var from = currentLogin + " <noreply@gmail.com>";
      var title = "["+solution.title+"] " + newDoc.title;
      var text =  lastComment.body;
      var u = Meteor.users.findOne({_id: uid});

      Meteor.call('sendEmail', from, u.profile.email, title, text);

    });
  },

});
