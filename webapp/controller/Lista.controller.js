sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/TextArea",
    "sap/ui/layout/form/SimpleForm",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Label, Input, TextArea, SimpleForm, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("br.com.gestao.fioriappreport234.controller.Lista", {
            onInit: function () {
                var oConfiguration = sap.ui.getCore().getConfiguration();
                oConfiguration.setFormatLocale("pt-BR")

            },

            onSearch: function () {
                // Capturando individualmente cada objeto Input do objeto Filter Bar
                var oProdutoInput = this.getView().byId("productIdInput");
                var oProdutoNomeInput = this.getView().byId("productNameInput");

                var oFilter = new Filter({
                    filters: [
                        new Filter("Productid", FilterOperator.Contains, oProdutoInput.getValue()),
                        new Filter("Name", FilterOperator.Contains, oProdutoNomeInput.getValue())
                    ],
                    and: true
                })

                // Criação do objeto Table e acesso a agregação Items onde sabemos qual a entidade onde será aplicado o filtro
                var oTable = this.getView().byId("tableProdutos");
                var binding = oTable.getBinding("items");

                // É aplicado o filtro 
                binding.filter(oFilter);
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

            onRouting: function () {
                debugger;
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Detalhes"); //Passar o name (do targets)
            },

            onSelectedItem: function (evt) {
                debugger;

                // Nós acessamos um contexto de um model com nome
                //var oProductId = evt.getSource().getBindingContext("Nome do Model").getProperty("Productid");

                // Passo 1 - Captura do valor do produto:
                var oProductId = evt.getSource().getBindingContext().getProperty("Productid");

                // Passo 2 - Envio para Route de Detalhes com parametro
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Detalhes",{
                    productId: oProductId
                });

            },

            // Nova função para enviarmos para o Git
            onFuncaoGit: function(){
                
            }

        });
    });
