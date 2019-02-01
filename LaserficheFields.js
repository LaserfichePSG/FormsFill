//This function is used to retrieve general entry detials through the WebAccessAPI
//Retrieved details include: Entry Name, Enrty Type and Template
function LaserficheEntryDetails(){
  if(window.parent !== window && window.parent.webAccessApi !== undefined) {
    var id = window.parent.webAccessApi.getSelectedEntries()[0].id;
    var entryName = window.parent.webAccessApi.getSelectedEntries()[0].name;
    var entryType = window.parent.webAccessApi.getSelectedEntries()[0].entryType;
    var templateName = window.parent.webAccessApi.getSelectedEntries()[0].templateName;
    $('.entry-id input').val(id);
    $('.entryName input').val(entryName);
    $('.entryType input').val(entryType);
    $('.templateName input').val(templateName);

  }
}

function GetDataFields(element, type) {
  var inputType;
  if (type === "select")
    inputType = 'select';
  else if (type === "longtext")
    inputType = 'textarea';
  else
    inputType = 'input';
  return element.find(inputType + ":not(.propCount)");
}

function GetFieldType(element) {
  var type = element.attr('attrtype');
  //if it is a collection, find the data field
  if(type === 'collection') { 
      var name = element.attr('attr');
      type = element.find('li[attr="' + name + '_Field"]').attr('attrtype');
  }
  else if (typeof type === "undefined")
  {
    if (element.find("div.cf-field>select").length > 0)
      type = 'select';
    else
      type = 'text';
  }
  return type;
}

//Triggered on document.ready
//This funtion is used to retrieve entry metadata fields through the WebAccessAPI
function LaserficheFields()
{
    var self = this;
    function LoadData() {
        if (window.parent !== window && window.parent.webAccessApi !== undefined) {
            var metadata = window.parent.webAccessApi.getFields();
            self.fieldData = metadata.fields.templateFields.concat(metadata.fields.supplementalFields);
            return self.fieldData;
        }
        else {
            return undefined;
        }
    }
    function GetField(fieldName) {
        var self = this;
        var fieldData = self.FieldData;
        return $(fieldData).filter(function(i, e) { return e.name === fieldName; });
    }
    function FillFields(fieldName, suppress) {
        var self = this;
        var fields;
        var i;
        var j;
        var selector;
        var element;
        var tempDate;
        var target;
        var field;
        var fieldType;
        var fieldData;
        var values;
        var val;
        
        suppress = (suppress === true);
        fieldData = self.FieldData;
        //If no field name is given fill all fields
        if(fieldName === undefined) {
            fields = fieldData;
        }
        else {
            //Find the field name and add it to the processing queue
            fields = self.GetField(fieldName);
        }
      
        if (typeof fields === 'undefined')
          return;
        
        
        //Fill the fields
        for(i = 0; i < fields.length; i += 1) {
          element = undefined;  //reset value
          tempDate = undefined;
          target = undefined;
          field = undefined;
          fieldType = undefined;
          values = undefined;
          v = undefined;
          
          field = fields[i];
          
          

          var inTable = false;
          element = $('li.form-q[attr="' + field.name.replace(/\W/g, '_') + '"]')
          
          if(element.length > 0) {
            //Assume we are only supporting text and dropdowns.
            fieldType = GetFieldType(element);
            target = GetDataFields(element, fieldType);
            
            //If a multivalued field click ADD enough times to get the correct number of fields.
            if(Array.isArray(field.value) && target.length < field.value.length) {
              if (inTable) {
                var tableParent = element.closest(".cf-table_parent");
                for(j = 0; j < field.value.length - target.length; j += 1) {
                  tableParent.find('.cf-table-add-row').click();
                }

                element = tableParent.find('td[data-title="' + field.name + '"]');
              }
              else {
                for(j = 0; j < field.value.length - target.length; j += 1) {
                  $('a[ref-id="' + element.attr('id') + '"]').click();
                }
              }
                
              target = GetDataFields(element, fieldType);
            }

            
            //Handle multivalue fields
            field.value = Array.isArray(field.value) ? field.value : [field.value];
            target.each(function(index, element){
                v = field.value[index];
                element = element instanceof jQuery ? element : $(element);
                if(v) {
                  	//add allowed field types here
                    if(fieldType === 'text' || fieldType === 'longtext' || fieldType === 'number' || fieldType === 'email' || fieldType === 'currency') { 
                      element.val(v);
                    }
                    //The dropdown menu may be filled by a lookup.  In this case the option does not
                    //exist. Add the option and then reselect it.
                    else if(fieldType === 'select') {
                        element.val(v);
                        if(element.val() === null) {
                            element.append('<option value="' + v + '">' + v + '</option>') 
                                .val(v);
                        }
                    }
                    //Format date strings so that we omit timestamps and convert to a user-readable format
                  	//JavaScript epoc date is 1/1/1900
                  	//JavaScript months are base 0
                    else if(fieldType === 'date' && v !== null) {
                        tempDate = new Date(v);
                        element.val((tempDate.getMonth() + 1) + '/' + tempDate.getDate() + '/' + (tempDate.getYear() + 1900));
                    }  
                }
            });
          }
        }
    }
  

    self.FieldData = LoadData();
    self.Refresh = LoadData;
    self.Fill = FillFields;
    self.GetField = GetField;
    
    return this;
}
