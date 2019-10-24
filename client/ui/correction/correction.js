import './correction.html'
import { Corrections, Tickets } from '../../../both'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

Meteor.startup(function () {
  Session.setDefault('hiddenPrettyTransform', 0);
})

// ----------- EVENTS

// Évènements liés au template "correction_form"
Template.correction_form.events({
  'submit .js-create-correction'(event, instance) {
    event.preventDefault()

    const content = event.target.content.value;
    Meteor.call('insertCorrection', { content: content, ticketId: FlowRouter.getParam('ticketId') },
      (err, res) => {
        if (!err) {
          event.target.content.value = '';
          Modal.show('correction_sended')
        } Modal.show('login')
      })
  },
})

Template.correction_single.events({
  'click .js-accept-correction'(event, instance) {

    Meteor.call('acceptCorrection', { id: this._id, status: this.status, ownerId: this.ownerId },
      (err, res) => {
        if (!err) console.log('accepted!')
      })
  },

  'click .js-refuse-correction'(event, instance) {

    Meteor.call('refuseCorrection', { id: this._id, status: this.status },
      (err, res) => {
        if (!err) console.log('refused!')
      })
  }
})

Template.correction_accepted_list.events({
	'change #hiddenPrettyTransform'(event, instance) {
		
   document.getElementById('hiddenPrettyTransform').checked ? Session.set("hiddenPrettyTransform", 1) : Session.set("hiddenPrettyTransform", 0)
    
  },
})


// ----------- SUBSCRIBE

Template.correction_form.onCreated(function () {
  this.subscribe('ticket.single', FlowRouter.getParam('ticketId'))
})

Template.correction_accepted_list.onCreated(function() {
	Session.set("hiddenPrettyTransform", 0)
	this.subscribe('ticket.single', FlowRouter.getParam('ticketId'))
})

// ----------- HELPERS

Template.correction_accepted_list.helpers({

  // Liste des commentaires liés au ticket
 	corrections() {
    return Corrections.find({ ticketId: FlowRouter.getParam('ticketId') })
    console.log()
  },

 	correctionsAccepted() {
    return Corrections.find({ ticketId: FlowRouter.getParam('ticketId'), status: "Acceptée" })
  },
	
	correctionsAcceptedTrue() {
		return Corrections.find().fetch().length > 0
	},

 	whoCanAppreciate() {
	 let user = Meteor.user()
	 let ticket = Tickets.findOne({ _id: FlowRouter.getParam('ticketId')})
	 
    if(user._id == ticket.ownerId || user.rank == 13) return true
	else return false			  
  },

})

Template.correction_form.helpers({
  // Ticket affiché sur la page
  ticket() {
    return Tickets.findOne({ _id: FlowRouter.getParam('ticketId') });
  }
})

Template.correction_single.helpers({

  // Vérifier le status de la correction
  statusPending(correctionStatus) {
    return correctionStatus === "En attente"
  },
  statusAccepted(correctionStatus) {
    return correctionStatus === "Acceptée"
  },
  statusRefused(correctionStatus) {
    return correctionStatus === "Refusée"
  },

  whoCanAppreciate() {
	 let user = Meteor.user()
	 let ticket = Tickets.findOne({ _id: FlowRouter.getParam('ticketId')})
	 
    if(user._id === ticket.ownerId || user.rank === 13) return true
	  
	else return false
  },

  transformContentCorrection(contentCorrection) {

    let contentTicket = Tickets.findOne({ _id: FlowRouter.getParam('ticketId') }).content

    let diffs = diff_match_patch.prototype.diff_main(contentTicket, contentCorrection)

    let prettyCorrection = diff_match_patch.prototype.diff_prettyHtml(diffs)

    return new Handlebars.SafeString(prettyCorrection)
  },
	
		
	isChecked() {
		if(Session.get('hiddenPrettyTransform') == 1) return true
	}
})




// ------- JS


