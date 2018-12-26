import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import snippetsIcon from '../theme/icons/snippets.svg';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import snippetsListView from './ui/snippetslistview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';

export default class Snippets extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ContextualBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Snippets';
	}

	init() {
		const editor = this.editor;

		editor.editing.view.addObserver( ClickObserver );

		editor.config.define( 'snippets', [
			{ name: 'smile', text: 'kanha' },
			{ name: 'wink', text: 'pako' },
			{ name: 'cool', text: 'koko' },
			{ name: 'surprise', text: 'fifi' },
			{ name: 'confusion', text: 'bob' },
			{ name: 'crying', text: 'mary' }
		] );

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		this._balloon = editor.plugins.get( ContextualBalloon );

		/**
		 * The form view displayed inside the balloon.
		 *
		 * @member {module:snippets/ui/snippetslistview~snippetsListView}
		 */
		this.formView = this._createForm();

		editor.ui.componentFactory.add( 'snippets', locale => {
			const button = new ButtonView( locale );

			button.isEnabled = true;
			button.label = editor.t( 'Snippets' );
			button.icon = snippetsIcon;
			button.tooltip = true;
			// Ugly hack for https://github.com/ckeditor/ckeditor5-ui/issues/350
			/* eslint-env browser */
			setTimeout( function() {
				button.iconView.set( 'viewBox', '0 0 600 600' );
			}, 0 );

			// Show the panel on button click.
			this.listenTo( button, 'execute', () => this._showPanel( true ) );

			return button;
		} );

		this._attachActions();
	}

	/**
	 * Creates the {@link module:snippets/ui/snippetslistview~SnippetsListView} instance.
	 *
	 * @private
	 * @returns {module:snippets/ui/snippetslistview~SnippetsListView} The snippets list view instance.
	 */
	_createForm() {
		const editor = this.editor;
		const snippetsView = new snippetsListView( editor );

		editor.config.get( 'snippets' ).forEach( snippets => {
			this.listenTo( snippetsView, 'snippets:' + snippets.name, () => {
				editor.model.change( writer => {
					writer.insertText( snippets.text, editor.model.document.selection.getFirstPosition() );
					this._hidePanel();
				} );
			} );
		} );

		// Close the panel on esc key press when the form has focus.
		snippetsView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hidePanel( true );
			cancel();
		} );

		return snippetsView;
	}

	/**
	 * Returns positioning options for the {@link #_balloon}. They control the way the balloon is attached
	 * to the target element or selection.
	 *
	 * If the selection is collapsed and inside a link element, the panel will be attached to the
	 * entire link element. Otherwise, it will be attached to the selection.
	 *
	 * @private
	 * @returns {module:utils/dom/position~Options}
	 */
	_getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		const target =
			view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() );

		return { target };
	}

	/**
	 * Adds the {@link #formView} to the {@link #_balloon}.
	 */
	_showPanel( ) {
		this._balloon.add( {
			view: this.formView,
			position: this._getBalloonPositionData()
		} );
	}

	/**
	 * Attaches actions that control whether the balloon panel containing the
	 * {@link #formView} is visible or not.
	 *
	 * @private
	 */
	_attachActions() {
		// Focus the form if the balloon is visible and the Tab key has been pressed.
		this.editor.keystrokes.set( 'Tab', ( data, cancel ) => {
			if ( this._balloon.visibleView === this.formView && !this.formView.focusTracker.isFocused ) {
				this.formView.focus();
				cancel();
			}
		}, {
			// Use the high priority because the snippets UI navigation is more important
			// than other feature's actions, e.g. list indentation.
			// https://github.com/ckeditor/ckeditor5-link/issues/146
			priority: 'high'
		} );

		// Close the panel on the Esc key press when the editable has focus and the balloon is visible.
		this.editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			if ( this._balloon.visibleView === this.formView ) {
				this._hidePanel();
				cancel();
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this.formView,
			activator: () => this._balloon.hasView( this.formView ),
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hidePanel()
		} );
	}

	/**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 *
	 * See {@link #_showPanel}.
	 *
	 * @protected
	 * @param {Boolean} [focusEditable=false] When `true`, editable focus will be restored on panel hide.
	 */
	_hidePanel( focusEditable ) {
		this.stopListening( this.editor.editing.view, 'render' );

		if ( !this._balloon.hasView( this.formView ) ) {
			return;
		}

		if ( focusEditable ) {
			this.editor.editing.view.focus();
		}

		this.stopListening( this.editor.editing.view, 'render' );
		this._balloon.remove( this.formView );
	}
}
