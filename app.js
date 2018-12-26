// app.js

// import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ClassicEditor from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Emoji from '@wwalc/ckeditor5-emoji/src/emoji';
import Snippets from './src/snippets';

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ Essentials, Paragraph, Bold, Italic, Emoji, Snippets ],
        toolbar: [ 'bold', 'italic', 'emoji', 'snippets' ]
    } )
    .then( editor => {
        console.log( 'Editor was initialized', editor );
    } )
    .catch( error => {
        console.error( error.stack );
    } );
