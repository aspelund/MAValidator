function MAValidator(){
};
//noinspection BadExpressionStatementJS
(function($)
{

    MAValidator.prototype.getSynchronousValidator = function(tester){
        return function(value){
            var dfd = new MADeferred();
            if(tester(value))
                dfd.resolve();
            else
                dfd.reject();
            return dfd.promise();
        };
    };
    MAValidator.prototype.getAsynchrounousValidator = function(tester){
        return function(element){
            var dfd = new MADeferred();
            var value = $(element).val();
            tester(value, dfd);
            return dfd.promise();
        };
    };

    MAValidator.prototype.getAjaxTester = function(paramName, params, url) {
        return function(value){
            var dfd = new MADeferred();
            params[paramName] = value;
            $.getJSON(url, params)
                .done(function (data) {
                    if (data.res >= 0) {
                        dfd.resolve();
                    } else {
                        dfd.reject(data.message);
                    }
                });
            return dfd.promise();
        };
    };

    var isInputEmpty = function(value){
        var dfd = new MADeferred();
        if(value==undefined ||  value.length==0)
            dfd.reject(MAValidator.prototype.messages.emptyError);
        else
            dfd.resolve();
        return dfd.promise();
    };
    var alwaysFail = function(){
        var dfd = new MADeferred();
        dfd.reject();
        return dfd.promise();
    }
    MAValidator.prototype.messages = {
        emailError:"Du har angett en felaktig epostadress",
        emptyError:"Du måste ange %noun%",
        shortPassword:"Ditt lösenord måste vara minst 8 tecken och innehålla både siffror och bokstäver."
    };

    var isValidPassword = function(password){
        var dfd = new MADeferred();
        if(password.length>=8 && password.match(/[A-Za-z]/)!=null && password.match(/[0-9]/)!=null){
            dfd.resolve();
        }else{
            dfd.reject(MAValidator.prototype.messages.shortPassword);
        }
        return dfd.promise();
    };
    var isValidEmail = function(email){
        var dfd = new MADeferred();
        if(!email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
            dfd.reject(MAValidator.prototype.messages.emailError);
        }else{
            dfd.resolve();
        }
        return dfd.promise();
    };
    var isValidPersonalNumber = function(personalNumber){
        var dfd = new MADeferred();
        if(!personalNumber.match(/^((\d{10})|(\d{12})|(\d{6}\-\d{4})|(\d{8}\-\d{4}))$/)){
            dfd.reject(MAValidator.prototype.messages.personalNumberError);
        }else{
            dfd.resolve();
        }
        return dfd.promise();
    };


    MAValidator.prototype.validators = {
        required:isInputEmpty,
        alwaysFail:alwaysFail,
        validEmail:isValidEmail,
        password:isValidPassword,
        personalNumber:isValidPersonalNumber
    };

    MAValidator.prototype.addCustomValidator = function(validationName, validationFunction){
        this.validators[validationName] = validationFunction;
    }

    MAValidator.prototype.validateElement = function(element,  checkEmpty){
        var self = this;
        var dfd = new MADeferred();
        var promise = dfd.promise();
        if(checkEmpty || $(element).val().length>0){
            var value = $(element).val();
            var validation = $(element).attr('data-validation');
            (validation!=undefined?validation:"").split(',').forEach(function(validationName){
                promise.then(function(){
                    if(self.validators[validationName]!=undefined){
                        var resultPromise = self.validators[validationName](value);
                        if(resultPromise){
                            return resultPromise;
                        }
                    }
                }).fail(function(errorMessage){
                        promise.deferredObject.errorElement = element;
                    });
            });
        }
        dfd.resolve();
        return promise;
    };
    MAValidator.prototype.validateForSubmit = function(selector){
        var dfd = new MADeferred();
        var promise = dfd.promise();
        var self = this;
        $(selector).each(function(){
            var element = this;
            promise.then(function(){
                return self.validateElement(element, true);
            });
        });
        promise.resolve();
        return promise;
    };

})(jQuery);