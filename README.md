MAValidator
===========

Small javascript validation library that is easy to use for async validation and validation chains. Uses MADeferred.

Here is an example validation for immediate validation after a input field has changed:
```javascript
        var validator = new MAValidator();
        $("#myForm input").change(function(){
            var element = this;
            clearSignsForElement(element);
            if($(element).val().length>0){
                var promise = validator.validateElement(element, false);
                promise.then(function(){
                    successFunction(element);
                }).fail(function(message){
                        errorFunction(element, message)
                    });
                    
                // This little code is added for handling io for async validation, that is if the returned promise isn't
                // resolved.
                if(MAPromise.prototype.isMAPromise(promise) && promise.deferredObject.state == promise.deferredObject.states.unknown){
                    var removeLoader = addLoader(element);
                    promise.always(removeLoader);
                }
            }
        });
```
And here is an example validation for submit:
```javascript
        $("#myForm #btnNext").click(function(){
            var promise = step1Validator.validateForSubmit($("#myForm input"));
            // The good thing here is that if we have async validations to be made,
            // we still wait for them.
            promise.then(function(){
                $("#josForm input").unbind();
                showStep2();
            })
                .fail(function(message){
                    addBubble(message, promise.deferredObject.errorElement);
                    errorFunction(promise.deferredObject.errorElement, message)
                });
        });
```

It's easy to add custom validators:
```javascript
        // getAjaxTester is a nice little helper function
        step1Validator.addCustomValidator('uniqueEmail', step1Validator.getAjaxTester('email', {format:'raw', field:'email'}, '/api/checkUniqueEmail.php'));
        step1Validator.addCustomValidator('samePassword', function(value){
            var dfd = new MADeferred();
            if(value==$("#password").val()){
                dfd.resolve();
            }else{
                dfd.reject("Please enter the same password.");
            }
            return dfd.promise();
        });
```
