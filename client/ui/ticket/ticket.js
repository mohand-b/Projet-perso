import { Tickets, Corrections } from '../../../both';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import './ticket.html';

// ----------- EVENTS

// Évènements liés au template "ticket_proposition"
Template.ticket_proposition.events({
	'click .btn-proposition-ticket'(event, instance) {
		FlowRouter.go('/create/ticket')
	},
});

// Évènements liés au template "ticket_create_form"
Template.ticket_create_form.events({
	
	'submit .js-create-ticket'(event, instance) {
		event.preventDefault();
		
		const title = event.target.title.value;
		const content = event.target.content.value;
		const private = event.target.private.checked;
		
		// Appel de la méthode créée pour la création d'un ticket
		Meteor.call('insertTicket', {title: title, content: content, private: private},
				   (err, res) => {
			if(!err) {
				event.target.title.value = '';
				event.target.content.value = '';
			}
		})
	},
	
	'click .btn-cancel'(event, instance){
		FlowRouter.go('/')
	}
});

// Évènements liés au template "ticket_edit_form"
Template.ticket_edit_form.events({
	// Modifier un ticket
	'submit .js-edit-ticket'(event, instance) {
		event.preventDefault()
		
		const title = event.target.title.value
		const content = event.target.content.value
		
		Meteor.call('updateTicket', { id: FlowRouter.getParam('ticketId'), title: title, content: content},
				   (err, res) => {
			if(!err) {
				FlowRouter.go('/ticket/:ticketId', {ticketId: FlowRouter.getParam('ticketId')})
			}console.log(err)
		})
	}
})

// Évènements liés au template "ticket_page"
Template.ticket_page.events({
	'click .js-closed-ticket'(event, instance){
	
		Meteor.call('closedTicket', FlowRouter.getParam('ticketId'),
				   (err, res) => {
			if(!err) {}
		})		
	}
})


// ----------- SUBSCRIBE

Template.ticket_edit_form.onCreated(function() {
	this.subscribe('ticket.single', FlowRouter.getParam('ticketId'))
})

Template.ticket_list.onCreated(function() {
	this.subscribe('tickets.list')
})

Template.ticket_page.onCreated(function() {
	this.subscribe('ticket.single', FlowRouter.getParam('ticketId'))
})

Template.ticket_single.onCreated(function() {
	this.subscribe('contributeurs')
})



// ----------- HELPERS

Template.ticket_page.helpers({
	// Ticket affiché sur la page
	ticket() {
		return Tickets.findOne({_id: FlowRouter.getParam('ticketId')})
	},
	openTicket(statusTicket) {
	return statusTicket === true
	},
	closedTicket(statusTicket) {
	return statusTicket === false
	}
})

Template.ticket_list.helpers({
	// Liste des tickets triés par date
	tickets() {
		return Tickets.find({}, { sort: {createdAt: -1}}).fetch()
	},
})

Template.ticket_edit_form.helpers({
	// Ticket affiché sur la page
	ticket() {
		return Tickets.findOne({_id: FlowRouter.getParam('ticketId')});
	}
})

Template.contributeurs.helpers({
	contributeurs(ticketid) {
		
		let correctionCursor = Corrections.find({ticketId: ticketid})
		let countContributeurs = correctionCursor.count()
		
		return  countContributeurs
	}
})

Template.ticket_single.helpers({
	closedTicket(statusTicket) {
	return statusTicket === false
	},
	recentTicket(createdAt) {
		
		let diff = {}
		let today = new Date()
		let tmp = createdAt - today
		
		tmp = Math.floor(tmp/1000);             // Nombre de secondes entre les 2 dates
		diff.sec = tmp % 60;                    // Extraction du nombre de secondes
 
		tmp = Math.floor((tmp-diff.sec)/60);    // Nombre de minutes (partie entière)
		diff.min = tmp % 60;                    // Extraction du nombre de minutes
 
		tmp = Math.floor((tmp-diff.min)/60);    // Nombre d'heures (entières)
		diff.hour = tmp % 24;                   // Extraction du nombre d'heures
     
		tmp = Math.floor((tmp-diff.hour)/24);   // Nombre de jours restants
		diff.day = tmp;
     
    if(diff.day > -1) return true;
	}
})