MAValidator
===========
The objective for this minimal library was to be able to easily validate html forms. The forms should be validated both immediately after input is done (i.e. the user has written an email and the input looses input) as well as before a submit of a form is done.
Moreover, I wanted the validator work with asynchronous and sychronous tests, and I wanted to be able to give the user instant feedback on the data entered, without having to mess with io in the validator itself.

Uses MADeferred (see https://github.com/aspelund/MADeferred/) and jQuery.

Here is an example validation for immediate validation after a input field has changed:
```html

<form>
        <input type='text' name='email' data-validation='required,email'/>
        <button>Send</button>
</form>
```
Elements are validated from the comma separated list of validators attribute ```data-validation```.
```javascript
        var validator = new MAValidator();
        $("form input").change(function(){
                var element = this;
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
        });
```
And here is an example validation for submit:
```javascript
        $("form button").click(function(){
                var promise = step1Validator.validateForSubmit($("#myForm input"));
                // The good thing here is that if we have async validations to be made,
                // we still wait for them.
                promise.then(function(){
                        // Success - Now do something
                })
                .fail(function(message){
                        // Fail - Now what?
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
