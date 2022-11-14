sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/TextArea",
    "sap/ui/layout/form/SimpleForm",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Label, Input, TextArea, SimpleForm, MessageBox) {
        "use strict";

        return Controller.extend("br.com.gestao.fioriappreport234.controller.i18n", {
            onInit: function () {
                //this.trocaIdioma();
                //sap-language=pt-br
                //sap-language=de
            }, 

            enviarCadastro: function () {
                //debugger;
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

                var Cliente = this.getView().byId("cliente").getValue();
                var Cidade = this.getView().byId("cidade").getValue();
                var Estado = this.getView().byId("estado").getValue();

                var sMensagem = oResourceBundle.getText("msgConfirmacao", [Cliente, Cidade, Estado]);

                MessageBox.confirm(sMensagem);
            },

            trocaIdioma: function () {
                var i18nModel = new sap.ui.model.resource.ResourceModel({
                    bundleUrl: "i18n/i18n.properties",
                    bundleLocale: "pt",
                    bundleName: "br.com.gestao.fioriappreport234.i18n.i18n_pt"
                })

                this.getView().setModel(i18nModel, "i18n");
            }
        });
    });
