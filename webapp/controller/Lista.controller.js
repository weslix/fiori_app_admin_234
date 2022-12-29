sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "br/com/gestao/fioriappadmin234/util/Formatter",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState",
    "sap/ui/model/json/JSONModel",
    "br/com/gestao/fioriappadmin234/util/Validator",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
    "sap/ui/model/odata/ODataModel",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, Formatter, Fragment, ValueState, JSONModel, Validator, MessageBox, BusyDialog, ODataModel, MessageToast) {
        "use strict";

        return Controller.extend("br.com.gestao.fioriappadmin234.controller.Lista", {
            objFormatter: Formatter,

            onInit: function () {
                var oConfiguration = sap.ui.getCore().getConfiguration();
                oConfiguration.setFormatLocale("pt-BR")

                sap.ui.getCore().attachValidationError(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Error);
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Success);
                })

            },

            criarModel: function () {
                // Model de apoio
                var oModel = new JSONModel();
                this.getView().setModel(oModel, "MDL_Produto");
            },

            onSearch: function () {
                // Capturando individualmente cada objeto Input do objeto Filter Bar
                var oProdutoInput = this.getView().byId("productIdInput");
                var oProdutoNomeInput = this.getView().byId("productNameInput");
                var oProdutoCategoriaInput = this.getView().byId("productCategoryInput");

                var objFilter = { filters: [], and: true };
                objFilter.filters.push(new Filter("Productid", FilterOperator.Contains, oProdutoInput.getValue()));
                objFilter.filters.push(new Filter("Name", FilterOperator.Contains, oProdutoNomeInput.getValue()));
                objFilter.filters.push(new Filter("Category", FilterOperator.Contains, oProdutoCategoriaInput.getValue()));

                var oFilter = new Filter(objFilter);

                //var oFilter = new Filter({
                //    filters: [
                //        new Filter("Productid", FilterOperator.Contains, oProdutoInput.getValue()),
                //        new Filter("Name", FilterOperator.Contains, oProdutoNomeInput.getValue())
                //    ],
                //    and: true
                //})

                // Criação do objeto Table e acesso a agregação Items onde sabemos qual a entidade onde será aplicado o filtro
                var oTable = this.getView().byId("tableProdutos");
                var binding = oTable.getBinding("items");

                // É aplicado o filtro 
                binding.filter(oFilter);
            },

            onRouting: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Detalhes"); //Passar o name (do targets)
            },

            onSelectedItem: function (evt) {

                // Nós acessamos um contexto de um model com nome
                //var oProductId = evt.getSource().getBindingContext("Nome do Model").getProperty("Productid");

                // Passo 1 - Captura do valor do produto:
                var oProductId = evt.getSource().getBindingContext().getProperty("Productid");

                // Passo 2 - Envio para Route de Detalhes com parametro
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Detalhes", {
                    productId: oProductId
                });
            },

            onCategoria: function (oEvent) {
                debugger;
                this._oInput = oEvent.getSource().getId();
                var oView = this.getView();

                //Verifico se o objeto fragment existe. Se não crio e adicono na View
                if (!this._CategoriaSearchHelp) {
                    this._CategoriaSearchHelp = Fragment.load({
                        id: oView.getId(),
                        name: "br.com.gestao.fioriappadmin234.frags.SH_Categorias",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }

                this._CategoriaSearchHelp.then(function (oDialog) {
                    //Limpando o filtro de categorias na abertura do fragment
                    oDialog.getBinding("items").filter([]);

                    // Abertura do fragment
                    oDialog.open();
                });

            },

            onNovoProduto: function (oEvent) {
                // Criar o Model Produto
                this.criarModel();
                var oView = this.getView();

                var t = this;

                //Verifico se o objeto fragment existe. Se não crio e adicono na View
                if (!this._Produto) {
                    this._Produto = Fragment.load({
                        id: oView.getId(),
                        name: "br.com.gestao.fioriappadmin234.frags.Insert",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }

                this._Produto.then(function (oDialog) {
                    // Abertura do fragment
                    oDialog.open();

                    debugger;
                    // Chamada da função para pegar os usuários
                    t.onGetUsuarios();

                    //t.getReadOpcoes();
                });
            },
            onValueHelpSearch: function (oEvent) {
                // Capturando o valor digitado pelo usuário:
                debugger;
                var sValue = oEvent.getParameter("value");

                // Opção 1 - Crio um único objeto filtro
                // Criando um objeto do tipo Filter que ira receber o valor e associar na propriedade Description
                //var oFilter = new Filter("Description", FilterOperator.Contains, sValue);
                //oEvent.getSource().getBinding("items").filter([oFilter]);


                // Opção 2 - Podemos criar um objeto (dinamico) onde adiociono várias propiredades
                var objFilter = { filters: [], and: false };
                objFilter.filters.push(new Filter("Description", FilterOperator.Contains, sValue));
                objFilter.filters.push(new Filter("Category", FilterOperator.Contains, sValue));
                objFilter.filters.push(new Filter("Fornecedores", FilterOperator.Contains, sValue));

                var oFilter = new Filter(objFilter);

                oEvent.getSource().getBinding("items").filter(oFilter);
            },

            onValueHelpClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                var oInput = null;

                if (this.byId(this._oInput)) {
                    oInput = this.byId(this._oInput);
                } else {
                    oInput = sap.ui.getCore().byId(this._oInput);
                }

                if (!oSelectedItem) {
                    oInput.resetProperty("value");
                    return;
                }

                oInput.setValue(oSelectedItem.getTitle());
            },

            onValida: function () {
                debugger;

                // Criação do Objeto Validator
                var validator = new Validator();

                // Checo a validação
                if (validator.validate(this.byId("_IDGenDialog1"))) {
                    this.onInsert();
                }
            },
            onInsert: function () {
                debugger;
                // 1 - criando uma referncia do objeto model que está recebendo as informações do fragment
                var oModel = this.getView().getModel("MDL_Produto");
                var objNovo = oModel.getData();

                // 2 - Manipular propriedades
                objNovo.Productid = this.geraID();
                objNovo.Price = objNovo.Price[0].toString();
                objNovo.Weightmeasure = objNovo.Weightmeasure.toString();
                objNovo.Width = objNovo.Width.toString();
                objNovo.Depth = objNovo.Depth.toString();
                objNovo.Height = objNovo.Height.toString();

                objNovo.Createdat = this.objFormatter.dateSAP(objNovo.Createdat);
                objNovo.Currencycode = "BRL";
                objNovo.Userupdate = "";

                // 3 - Criando uma referencia do arquivo i18n
                var bundle = this.getView().getModel("i18n").getResourceBundle();

                // Variavel contexto da View
                var t = this;

                // 4 - Criar o objeto model referencia do model default (OData)
                var oModelProduto = this.getView().getModel();

                MessageBox.confirm(
                    bundle.getText("insertDialogMsg"), // Pergunta para o processo
                    function (oAction) { // Função de disparo do insert{

                        debugger;
                        // Verificando se o usuário confirmou ou não a operação
                        if (MessageBox.Action.OK === oAction) {

                            // Criamos um BusyDialog
                            t._oBusyDialog = new BusyDialog({
                                text: bundle.getText("Sendind")
                            });
                            t._oBusyDialog.open();

                            setTimeout(function () {
                                // Realaiza a chamada para o SAP
                                var oModelSend = new ODataModel(oModelProduto.sServiceUrl, true);

                                oModelSend.create("Produtos", objNovo, null,
                                    function (d, r) { // Função de retorno Sucesso
                                        if (r.statusCode === 201) { // Sucesso na criação
                                            MessageToast.show(bundle.getText("insertDialogSuccess", [objNovo.Productid]), {
                                                duration: 4000
                                            });
                                            // iremos fechar o objeto Dialog do fragment
                                            t.dialogClose();
                                            // dar um refresh no model default
                                            t.getView().getModel().refresh();

                                            // fechar o BusyDialog
                                            t._oBusyDialog.close();
                                        }
                                    }, function (e) { // Função de retorno Erro
                                        // fechar o BusyDialog
                                        t._oBusyDialog.close();
                                        var oRet = JSON.parse(e.response.body);
                                        MessageToast.show(oRet.error.message.value, {
                                            duration: 4000
                                        });
                                    });

                            }, 2000);
                        }
                    },
                    bundle.getText("insertDialogTitle"), // Exibe o título do Dialog
                );


            },

            // Geramos um ID de Ptroduto Dinamico
            geraID: function () {
                return 'xxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0,
                        v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16).toUpperCase();
                });

            },

            // Fechamento do Dialog do Fragment de Insert
            dialogClose: function () {
                this._Produto.then(function (oDialog) {
                    // Fechamento do fragment
                    oDialog.close();
                });
            },
            // Capturar a coleção de usuário de um novo serviço OData
            onGetUsuarios: function () {
                debugger;

                var t = this;
                var strEntity = "/sap/opu/odata/sap/ZSB_USERS_234";

                // Realaiza a chamada para o SAP
                var oModelSend = new ODataModel(strEntity, true);

                oModelSend.read("/Usuarios", {
                    success: function (oData, results) { // Sucesso do Get
                        if (results.statusCode === 200) {
                            var oModelUsers = new JSONModel();
                            oModelUsers.setData(oData.results);
                            t.getView().setModel(oModelUsers, "MDL_Users");
                        }
                    },
                    error: function (e) {
                        var oRet = JSON.parse(e.response.body);
                        MessageToast.show(oRet.error.message.value, {
                            duration: 4000
                        });
                    }
                });
            },

            // localizar um fornecedor baseado no input do usuário
            getSupplier: function (evt) {

                debugger;

                this._oInput = evt.getSource().getId();
                var oValue = evt.getSource().getValue();

                // URL de chamada de um fornecedor
                var sElement = "Fornecedores('" + oValue + "')";

                // Cria o objeto model default
                var oModel = this.getView().getModel();

                // Model onde o usuário realiza o preenchimento das informações de produto
                var oModelProduto = this.getView().getModel("MDL_Produto");

                // Realaiza a chamada para o SAP
                var oModelSend = new ODataModel(oModel.sServiceUrl, true);

                oModelSend.read(sElement, {
                    success: function (oData, results) { // Sucesso do Get
                        if (results.statusCode === 200) {
                            oModelProduto.setProperty("/Supplierid", oData.Lifnr);
                            oModelProduto.setProperty("/Suppliername", oData.Name1);
                        }
                    },
                    error: function (e) {
                        oModelProduto.setProperty("/Supplierid", "");
                        oModelProduto.setProperty("/Suppliername", "");

                        var oRet = JSON.parse(e.response.body);
                        MessageToast.show(oRet.error.message.value, {
                            duration: 4000
                        });
                    }
                });
            },
            // Aplicar um filtro na entidade Forncedores
            onSuggest: function (evt) {
                debugger;
                var sText = evt.getParameter("suggestValue");
                var aFilters = [];

                if (sText) {
                    aFilters.push(new Filter("Lifnr", FilterOperator.Contains, sText));
                }

                evt.getSource().getBinding("suggestionItems").filter(aFilters);
            },
            getReadOpcoes: function () {
                debugger;

                // Item 1 - Chamada via URL
                var sElement = "/Produtos";
                // var sElement = "/Produtos('322E3BBF5A')";
                // var sElement = "/Produtos('322E3BBF5A')/to_cat";
                
                var afilters = [];
                // afilters.push(new Filter("Status", FilterOperator.EQ, 'E'));
                // afilters.push(new Filter("Category", FilterOperator.EQ, 'CPDA'));

                // Cria o objeto model default 
                var oModel = this.getView().getModel();

                // Realizar a chamada para o SAP
                var oModelSend = new ODataModel(oModel.sServiceUrl, true);

                oModelSend.read(sElement, {
                    filters: afilters,
                    urlParameters: {
                        $expand: "to_cat"

                    },
                    success: function (oData, results) {
                        if (results.statusCode === 200) { // Sucesso do Get 
                        }                                              
                    },
                    error: function (e) {
                        var oRet = JSON.parse(e.response.body);
                        MessageToast.show(oRet.error.message.value, {
                            duration: 4000
                        });
                    }
                });
            }   
        })
    });
