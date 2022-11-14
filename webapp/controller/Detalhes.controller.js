sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/NumberFormat"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, NumberFormat) {
        "use strict";

        return Controller.extend("br.com.gestao.fioriappreport234.controller.Detalhes", {
            // Criar o meu objeto Route e acoplando a função que fará o bidingElement
            onInit: function () {
                debugger;
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("Detalhes").attachMatched(this.onBindingProdutoDetalhes, this)
            },

            onBindingProdutoDetalhes: function (oEvent) {
                debugger;
                // Capturando o parametro trafegado no Route Detalhes (productId)
                var oProduto = oEvent.getParameter("arguments").productId;

                // Objeto referente a view Detalhes
                var oView = this.getView();

                // Criar a URL de chamada da nossa entidade de Produtos
                var sURL = "/Produtos('" + oProduto + "')";

                oView.bindElement({
                    path: sURL,
                    parametrs: { expand: 'to_cat' },
                    events: {
                        change: this.onBindingChange.bind(this),
                        dataRequested: function () {
                            debugger;
                            oView.setBusy(true);
                        },
                        dataReceived: function (data) {
                            debugger;
                            oView.setBusy(false);
                        }
                    }
                });
            },

            onBindingChange: function (oEvent) {
                debugger;
                var oView = this.getView();
                var oElementBinding = oView.getElementBinding();

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                // se não existir um elemento (registro) válido eu farei uma ação
                if (!oElementBinding.getBoundContext()) {
                    oRouter.getTargets().display("objNotFound");
                    return;
                }
            },

            onNavBack: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Lista");
            },

            date: function (value) {
                var oConfiguration = sap.ui.getCore().getConfiguration();
                var oLocale = oConfiguration.getFormatLocale();
                var oPattern = "";

                if (oLocale === "pt-BR") {
                    oPattern = "MMM/YYYY";
                } else {
                    oPattern = "YYYY/MM/dd";
                }

                if (value) {
                    var year = new Date(value).getFullYear();
                    if (year === 999) {
                        return "";
                    } else {
                        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                            //style: "short"
                            pattern: oPattern
                        });
                        return oDateFormat.format(new Date(value));
                    }
                } else {
                    return value;
                }
            },

            // Apresentar o texto do status mediante a propriedade Status do model
            statusProduto: function (value) {
                var oBundle = this.getView().getModel("i18n").getResourceBundle();
                try {
                    return oBundle.getText("status" + value);
                } catch (err) {
                    return "";
                }
            },

            // Apresentar o estado (cor) do objectStatus mediante a propriedade Status do model
            stateProduto: function (value) {
                //statusE = Em Estoque
                //statusP = Em Produção
                //statusF = Fora de Estoque
                try {
                    if (value === "E") { return "Success"; }
                    else if (value === "P") { return "Warning"; }
                    else if (value === "F") { return "Error"; }
                    else { return "None"; }

                } catch (err) {
                    return "None";
                }
            },

            // Apresentar o estado (icone) mediante a propriedade Status do model
            iconProduto: function (value) {
                //statusE = Em Estoque
                //statusP = Em Produção
                //statusF = Fora de Estoque
                try {
                    if (value === "E") { return "sap-icon://sys-enter-2"; }
                    else if (value === "P") { return "sap-icon://alert"; }
                    else if (value === "F") { return "sap-icon://error"; }
                    else { return "None"; }

                } catch (err) {
                    return "None";
                }
            },

            // Apresentar os valores numéricos formatados tipo decimal
            floatNumber: function (value) {
                var numFloat = NumberFormat.getFloatInstance({
                    maxFractionDigits: 2,
                    minFractionDigits: 2,
                    groupingEnabled: true,
                    groupingSeparator: ".",
                    decimalSeparator: ","
                });
                return numFloat.format(value);
            }

        });
    });
