/**
 * @jest-environment jsdom
*/

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import '@testing-library/jest-dom/extend-expect';
import mockedBills from "../__mocks__/store.js";
import mockStore from "../__mocks__/store"
jest.mock("../app/store", () => mockStore)

import router from "../app/Router.js";


describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {

            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            //to-do write expect expression
            expect(windowIcon).toHaveClass("active-icon")
        })
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills })
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })
    })
    /* ----------------------------------------------------------------*/
    
    describe("When I am on Bills Page", () => {
        test("Then the clickable button should be present on the page", () => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)

            const newBillBtn = screen.getByTestId('btn-new-bill')
            expect(newBillBtn).toBeVisible();

            const eyeIcons = screen.getAllByTestId('icon-eye')
            eyeIcons.forEach((eyeIcon) => {
                expect(eyeIcon).toBeVisible();
            });
        })
    })
    
    // test d'intégration GET
    describe("When I am on Bills Page", () => {
        test("Then the bills should be fetched", () => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            
            const tableContainer = screen.getByTestId("tbody");
            expect(tableContainer).toBeTruthy();
            
            const rows = screen.getAllByRole("row");
            const billsRowsLenght = bills.length;
            const totalRowsNb = billsRowsLenght + 1;
            expect(rows).toHaveLength(totalRowsNb);
        });
    });
    
    describe('When I am on Bills Page, and I click on the bills eye icon', () => {
        test('Then the modal should open', () => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            document.body.innerHTML = BillsUI({ data: bills })
            
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname })
            }
            const myBills = new Bills({
                document, onNavigate, store: mockedBills, localStorage
            })
            
            const handleClickIconEye = jest.fn(myBills.handleClickIconEye);
            const iconEyes = screen.getAllByTestId("icon-eye");
            
            const modale = document.getElementById("modaleFile");
            //TypeError: $(...).modal is not a function
            $.fn.modal = jest.fn(() => modale.classList.add("show"));
            
            iconEyes.forEach(iconEye => {
                iconEye.addEventListener("click", handleClickIconEye(iconEye));
                fireEvent.click(iconEye);
                expect(handleClickIconEye).toHaveBeenCalled();
                expect($.fn.modal).toHaveBeenCalled();
                expect(modale).toHaveClass("show");
            });
        })
    })

    describe('When I click on Nouvelle note de frais', () => {
        test('Then i should be sent on the newBill page', () => {
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
          }))
          document.body.innerHTML = BillsUI(bills)
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          const store = null
          const myBills = new Bills({
            document, onNavigate, store, bills, localStorage: window.localStorage
          })
          const newBillBtn = screen.getByTestId("btn-new-bill")
          const handleClickNewBill = jest.fn(() => myBills.handleClickNewBill())
          newBillBtn.addEventListener("click", handleClickNewBill)
          fireEvent.click(newBillBtn)
          expect(handleClickNewBill).toHaveBeenCalled()
          const newBillForm = screen.queryByTestId("form-new-bill")
          expect(newBillForm).toBeTruthy()
        })
    })
    
    describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills")
          Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
          )
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee',
            email: "a@a"
          }))
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.appendChild(root)
          router()
        })
        test("fetches bills from an API and fails with 404 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 404"))
              }
            }
          })
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = screen.getByText(/Erreur 404/)
          expect(message).toBeTruthy()
        }) 
        test("fetches messages from an API and fails with 500 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 500"))
              }
            }
          })
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = screen.getByText(/Erreur 500/)
          expect(message).toBeTruthy()
        })
      })
})