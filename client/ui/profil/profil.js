import { Tickets, Corrections } from '../../../both';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import './profil.html'


// ----------- EVENTS

Template.profil.events({
	'click .logout-js'(event, instance) {
		Meteor.logout()
		FlowRouter.go('/')
	},
})


// ----------- SUBSCRIBE


Template.profil.onCreated(function() {
	this.subscribe('profil', FlowRouter.getParam('userId'))
	this.subscribe('tickets.list')
	this.subscribe('tickets.list.private')
})





// ----------- HELPERS

Template.profil.helpers({
	// Liste des tickets triés par date
	profilInfos() {
		return Meteor.users.findOne({_id: FlowRouter.getParam('userId')})
	},
	
	lastTickets() {
		return Tickets.find({ownerId: FlowRouter.getParam('userId')}).fetch()
	},
	
	countContributions() {
		let contributionsUser = Corrections.find({ownerId: FlowRouter.getParam('userId')}).fetch()
		return Object.keys(contributionsUser).length
	},
	
	currentUserProfil() {
		return FlowRouter.getParam('userId') === Meteor.userId()
	}
})
