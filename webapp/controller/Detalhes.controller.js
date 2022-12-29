sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/NumberFormat",
    "br/com/gestao/fioriappadmin234/util/Formatter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "br/com/gestao/fioriappadmin234/util/Validator",
    "sap/ui/core/ValueState",
    "sap/m/MessageBox",
    "sap/m/BusyDialog"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, NumberFormat, Formatter, Fragment, JSONModel, ODataModel, MessageToast, Filter, FilterOperator, Validator, ValueState, MessageBox, BusyDialog) {
        "use strict";

        return Controller.extend("br.com.gestao.fioriappadmin234.controller.Detalhes", {
            objFormatter: Formatter,

            // Criar o meu objeto Route e acoplando a função que fará o bidingElement
            onInit: function () {
                debugger;
                sap.ui.getCore().attachValidationError(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Error);
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Success);
                });

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("Detalhes").attachMatched(this.onBindingProdutoDetalhes, this);

                debugger;
                // 1 - Chamar a função onde irá fazer o carregamento dos fragments iniciais
                this._formFragments = {};

                this._showFormFragments("DisplayBasicInfo", "vboxViewBasicInfo");
                this._showFormFragments("DisplayTechInfo", "vboxViewTechInfo");

            },

            // 2 - Recebe como parâmetro o nome do Fragment e o nome do VBox de destino
            _showFormFragments: function (sFragmentName, sVboxName) {
                debugger
                var objVBox = this.byId(sVboxName);
                objVBox.removeAllItems();

                this._getFormAllItems(sFragmentName).then(function (oVBox) {
                    objVBox.insertItem(oVBox);
                });
            },

            // 3 - Cria o objeto Fragment baseado no nome e adiciona em um objeto com uma coleção de fragments
            _getFormAllItems: function (sFragmentName) {
                var oFormFragment = this._formFragments[sFragmentName];
                var oView = this.getView();

                if (!oFormFragment) {
                    oFormFragment = Fragment.load({
                        id: oView.getId(),
                        name: "br.com.gestao.fioriappadmin234.frags." + sFragmentName,
                        controller: this
                    });

                    this._formFragments[sFragmentName] = oFormFragment;
                }

                return oFormFragment;
            },

            onBindingProdutoDetalhes: function (oEvent) {
                debugger;
                // Capturando o parametro trafegado no Route Detalhes (productId)
                var oProduto = oEvent.getParameter("arguments").productId;

                // Objeto referente a view Detalhes
                var oView = this.getView();

                // Criar um parâmetro de controle para redirecionamento da view após o Delete
                this._bDelete = false;

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

                    // Se não existe o registro e não estamos na operação de Delete
                    if (!this._bDelete) {
                        oRouter.getTargets().display("objNotFound");
                        return;
                    }
                } else {
                    // Clonamos o registro atual
                    this._oProduto = Object.assign({}, oElementBinding.getBoundContext().getObject());
                }
            },

            criarModel: function () {
                // Model de apoio
                var oModel = new JSONModel();
                this.getView().setModel(oModel, "MDL_Produto");
            },

            onNavBack: function () {
                // Desabilitar a edição. Ficar somente leitura
                this._HabilitaEdicao(false);
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Lista");
            },

            handleEditPress: function () {
                debugger;
                // Criando nosso model de Produto
                this.criarModel();

                // Atribui no objeto model o registro clonado
                var oModelProduto = this.getView().getModel("MDL_Produto");
                oModelProduto.setData(this._oProduto);

                // Recupera os usuários
                this.onGetUsuarios();

                // Habilitar a edição
                this._HabilitaEdicao(true);
            },

            handleCancelPress: function () {
                // Restore do registro atual do model
                var oModel = this.getView().getModel();
                oModel.refresh(true);

                // Voltamos para somente leitura
                this._HabilitaEdicao(false);
            },

            _HabilitaEdicao: function (bEdit) {
                var oView = this.getView();

                debugger;

                // Botões de ações
                oView.byId("btnEdit").setVisible(!bEdit);
                oView.byId("btnDelete").setVisible(!bEdit);
                oView.byId("btnSave").setVisible(bEdit);
                oView.byId("btnCancel").setVisible(bEdit);

                // Habilitar / Desabilitar Seções
                oView.byId("_IDGenObjectPageSection1").setVisible(!bEdit);
                oView.byId("_IDGenObjectPageSection2").setVisible(!bEdit);
                oView.byId("_IDGenObjectPageSection3").setVisible(bEdit);

                if (bEdit) {
                    this._showFormFragments("Change", "vboxViewChangeProduct");
                } else {
                    this._showFormFragments("DisplayBasicInfo", "vboxViewBasicInfo");
                    this._showFormFragments("DisplayTechInfo", "vboxViewTechInfo");
                }
            },

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

            onValida: function () {
                debugger;

                // Criação do Objeto Validator
                var validator = new Validator();

                // Checo a validação
                if (validator.validate(this.byId("vboxChangeProduct"))) {
                    this.onUpdate();
                }
            },

            onUpdate: function () {
                debugger;
                // 1 - criando uma referncia do objeto model que está recebendo as informações do fragment
                var oModel = this.getView().getModel("MDL_Produto");
                var objUpdate = oModel.getData();
                var sPath = this.getView().getElementBinding().getPath();

                // 2 - Manipular propriedades
                objUpdate.Price = objUpdate.Price.toString();
                objUpdate.Weightmeasure = objUpdate.Weightmeasure.toString();
                objUpdate.Width = objUpdate.Width.toString();
                objUpdate.Depth = objUpdate.Depth.toString();
                objUpdate.Height = objUpdate.Height.toString();
                objUpdate.Changedat = new Date().toISOString().substring(0, 19);

                delete objUpdate.to_cat;
                delete objUpdate.__metadata;

                // 3 - Criando uma referencia do arquivo i18n
                var bundle = this.getView().getModel("i18n").getResourceBundle();

                // Variavel contexto da View
                var t = this;

                // 4 - Criar o objeto model referencia do model default (OData)
                var oModelProduto = this.getView().getModel();

                MessageBox.confirm(
                    bundle.getText("updateDialogMsg", [objUpdate.Productid]), // Pergunta para o processo
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

                                oModelSend.update(sPath, objUpdate, null,
                                    function (d, r) { // Função de retorno Sucesso
                                        if (r.statusCode === 204) { // Sucesso na criação

                                            // fechar o BusyDialog
                                            t._oBusyDialog.close();

                                            MessageBox.success(bundle.getText("updateDialogSuccess", [objUpdate.ProductId]))

                                            // Voltar somente para leitura
                                            t.handleCancelPress();

                                        }
                                    }, function (e) { // Função de retorno Erro
                                        // fechar o BusyDialog
                                        t._oBusyDialog.close();
                                        var oRet = JSONModel.parse(e.response.body);
                                        MessageToast.show(oRet.error.message.value, {
                                            duration: 4000
                                        });
                                    });

                            }, 2000);
                        }
                    },
                    bundle.getText("updateDialogTitle"), // Exibe o título do Dialog
                );

            },

            onDelete: function () {
                debugger;

                var objDelete = this.getView().getElementBinding().getBoundContext().getObject();
                var sPath = this.getView().getElementBinding().getPath();
                var bundle = this.getView().getModel("i18n").getResourceBundle();
                var t = this;
                var oModelProduto = this.getView().getModel();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                MessageBox.confirm(
                    bundle.getText("deleteDialogMsg", [objDelete.Productid]), // Pergunta para o processo
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

                                oModelSend.remove(sPath, {
                                    success: function (d, r) { // Função de retorno Sucesso
                                        if (r.statusCode === 204) { // Sucesso no delete

                                            // fechar o BusyDialog
                                            t._oBusyDialog.close();

                                            // setar no parâmetro de Delete
                                            t._bDelete = true;

                                            MessageBox["information"](bundle.getText("deleteDialogSuccess", [objDelete.Productid]),
                                            {
                                                actions: [MessageBox.Action.OK],
                                                onClose:function(oAction) {
                                                    if (oAction === MessageBox.Action.OK) {
                                                        debugger;
                                                        t.getView().getModel().refresh();
                                                        oRouter.navTo("Lista");
                                                    }
                                                }.bind(this)
                                            });
                                        }
                                    },
                                    error: function (e) { // Função de retorno Erro
                                        // fechar o BusyDialog
                                        t._oBusyDialog.close();
                                        var oRet = JSON.parse(e.response.body);
                                        MessageToast.show(oRet.error.message.value, {
                                            duration: 4000
                                        });
                                    }
                                });

                            }, 2000);
                        }
                    },
                    bundle.getText("deleteDialogTitle"), // Exibe o título do Dialog
                );

            },

        })
    });
