// Allow for split cells in jupyter notebooks

define([
	'base/js/namespace',
    'notebook/js/textcell',
    'notebook/js/codecell',
    ]), function(Ipython, textcell, codecell){
	"use strict";

	Ipython.notebook.cell_style = "split";

	Ipython.notebook.set_cell_style = function(cell_style){
    		this.cell_style = cell_style
		};

	Ipython.notebook.get_cell_style_html = function(cell_style){
        if (cell_style == "split") 
            {return "float:left; width:50%;";}
        return "width:100%;";
    	};

	Ipython.notebook.insert_cell_at_index = function(type, index){
	    var ncells = this.ncells();
	    index = Math.min(index, ncells);
	    index = Math.max(index, 0);
	    var cell = null;
	    type = type || this.class_config.get_sync('default_cell_type');
	    if (type === 'above') {
	        if (index > 0) {
	            type = this.get_cell(index-1).cell_type;
	        } else {
	            type = 'code';
	        }
	    } else if (type === 'below') {
	        if (index < ncells) {
	            type = this.get_cell(index).cell_type;
	        } else {
	            type = 'code';
	        }
	    } else if (type === 'selected') {
	        type = this.get_selected_cell().cell_type;
	    }

	    if (ncells === 0 || this.is_valid_cell_index(index) || index === ncells) {
	        var cell_options = {
	            events: this.events, 
	            config: this.config, 
	            keyboard_manager: this.keyboard_manager, 
	            notebook: this,
	            tooltip: this.tooltip,
	        };
	        switch(type) {
	        case 'code':
	            cell = new codecell.CodeCell(this.kernel, cell_options);
	            cell.set_input_prompt();
	            break;
	        case 'markdown':
	            cell = new textcell.MarkdownCell(cell_options);
	            break;
	        case 'raw':
	            cell = new textcell.RawCell(cell_options);
	            break;
	        default:
	            console.log("Unrecognized cell type: ", type, cellmod);
	            cell = new cellmod.UnrecognizedCell(cell_options);
	        }

	        // overwite our json function
	        var cell_style_html = this.get_cell_style_html.apply(this, [this.cell_style]);
	        cell.attr({'tabindex':'2', 'style':cell_style_html});
	        //cell.fromJSON = fromJSON
	        //cell.toJSON = toJSON

	        if(this._insert_element_at_index(cell.element,index)) {
	            cell.render();
	            this.events.trigger('create.Cell', {'cell': cell, 'index': index});
	            cell.refresh();
	            // We used to select the cell after we refresh it, but there
	            // are now cases were this method is called where select is
	            // not appropriate. The selection logic should be handled by the
	            // caller of the the top level insert_cell methods.
	            this.set_dirty(true);
	        	}	
		   		 }
		return cell;

		};

	return {
		load_ipython_extensions : load_ipython_extensions
		};
};


// var action= {'cell-style-centered' : {
//             help: 'select cell style centered ',
//             icon: 'cell-style',
//             help_index : 'el',
//             handler : function (env) {
//                 env.notebook.set_cell_style('center');
//             }
//          },
//         'cell-style-split' : {
//             help: 'select cell style split ',
//             icon: 'cell-style',
//             help_index : 'el',
//             handler : function (env) {
//                 env.notebook.set_cell_style('split');
//             }
//         },



// fromJSON = function (data) {
//         if (data.metadata !== undefined) {
//             this.metadata = data.metadata;
//         }
// 		if (data.cell_style !== undefined){
//             this.cell_style = data.cell_style ;
//            }
//         else {this.cell_style = 'center';}


// toJSON = function () {
//     var data = {};
//     // deepcopy the metadata so copied cells don't share the same object
//     data.metadata = JSON.parse(JSON.stringify(this.metadata));
//     data.cell_type = this.cell_type;
//     data.cell_style = this.cell_style || "width=100%;";
//     return data;
// };


// Ipython.notebook.fromJSON = function (data) {

//         var content = data.content;
//         var ncells = this.ncells();
//         var i;
//         for (i=0; i<ncells; i++) {
//             // Always delete cell 0 as they get renumbered as they are deleted.
//             this._unsafe_delete_cell(0);
//         }
//         // Save the metadata and name.
//         this.metadata = content.metadata;
//         this.notebook_name = data.name;
//         this.notebook_path = data.path;
//         var trusted = true;
        
//         // Set the codemirror mode from language_info metadata
//         if (this.metadata.language_info !== undefined) {
//             var langinfo = this.metadata.language_info;
//             // Mode 'null' should be plain, unhighlighted text.
//             var cm_mode = langinfo.codemirror_mode || langinfo.name || 'null';
//             this.set_codemirror_mode(cm_mode);
//         }
        
//         var new_cells = content.cells;
//         ncells = new_cells.length;
//         var cell_data = null;
//         var new_cell = null;
//         for (i=0; i<ncells; i++) {
//             cell_data = new_cells[i];
//             this.cell_style = cell_data.cell_style || 'center'
//             new_cell = this.insert_cell_at_index(cell_data.cell_type, i);
//             new_cell.fromJSON(cell_data);
//             if (new_cell.cell_type === 'code' && !new_cell.output_area.trusted) {
//                 trusted = false;
//             }
//         }
//         if (trusted !== this.trusted) {
//             this.trusted = trusted;
//             this.events.trigger("trust_changed.Notebook", trusted);
//         }
//     };