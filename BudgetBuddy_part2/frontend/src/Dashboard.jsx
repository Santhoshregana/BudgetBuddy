import { useEffect, useState } from 'react'
import api from './api'

const dateNow = () => new Date().toLocaleDateString('en-CA')
const cash = (value, currency) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR' }).format(Number(value || 0))

export default function Dashboard({ onLogout }) {
  const [page, setPage] = useState('Overview')
  const [profile, setProfile] = useState({ currency: 'INR', display_name: '' })
  const [summary, setSummary] = useState({})
  const [expenses, setExpenses] = useState([])
  const [incomes, setIncomes] = useState([])
  const [budgets, setBudgets] = useState([])
  const [notice, setNotice] = useState('')
  const [expense, setExpense] = useState({ category: 'Food', amount: '', spent_on: dateNow(), description: '' })
  const [income, setIncome] = useState({ source: 'Pocket money', amount: '', received_on: dateNow(), notes: '' })
  const [budget, setBudget] = useState({ name: 'Monthly budget', amount: '', start_date: dateNow().slice(0, 8) + '01', end_date: dateNow() })

  async function refresh() {
    try {
      const [p, s, e, i, b] = await Promise.all([api.get('/profiles/me/'), api.get('/dashboard/summary/'), api.get('/expenses/'), api.get('/incomes/'), api.get('/budgets/')])
      setProfile(p.data); setSummary(s.data); setExpenses(e.data); setIncomes(i.data); setBudgets(b.data)
    } catch (error) { setNotice(error.response?.data?.detail || 'Could not load your data. Please log in again.') }
  }
  useEffect(() => { refresh() }, [])
  async function save(path, data, reset) {
    const { id, ...payload } = data
    try { if (id) await api.patch(`${path}${id}/`, payload); else await api.post(path, payload); reset(); await refresh(); setNotice(id ? 'Changes saved.' : 'Saved.') }
    catch (error) { setNotice(JSON.stringify(error.response?.data || 'Could not save this record.')) }
  }
  async function remove(path, id) {
    if (!window.confirm('Delete this record?')) return
    try { await api.delete(`${path}${id}/`); await refresh(); setNotice('Record deleted.') } catch { setNotice('Could not delete this record.') }
  }
  async function saveProfile(event) {
    event.preventDefault()
    try { await api.patch('/profiles/me/', profile); await refresh(); setNotice('Profile updated.') }
    catch (error) { setNotice(JSON.stringify(error.response?.data || 'Could not update profile.')) }
  }
  const currency = profile.currency || 'INR'
  const pages = ['Overview', 'Expenses', 'Income', 'Budgets', 'Profile']

  return <main className="dashboard">
    <header className="dash-header"><div className="dash-brand"><span className="brand-mark">B</span><span>BudgetBuddy<small>STUDENT FINANCE</small></span></div><div className="dash-user">Hi, {profile.display_name || 'there'} <button className="secondary small" onClick={onLogout}>Log out</button></div></header>
    <div className="dash-body"><div className="dash-title"><div><p className="eyebrow">YOUR MONEY, MORE INTENTIONAL</p><h1>{page === 'Overview' ? 'Your money at a glance' : page}</h1><p className="muted">Keep your day-to-day money organized in one place.</p></div><span className="date-chip">{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span></div>
      <nav className="tabs">{pages.map(name => <button key={name} className={page === name ? 'tab active' : 'tab'} onClick={() => { setPage(name); setNotice('') }}>{name}</button>)}</nav>
      {notice && <p className="message" role="status">{notice}</p>}
      {page === 'Overview' && <><section className="stat-grid"><Stat title="Income recorded" value={summary.income} currency={currency}/><Stat title="Expenses recorded" value={summary.expenses} currency={currency}/><Stat title="Net this month" value={summary.net} currency={currency}/><article className="stat-card"><span>Active budgets</span><strong>{summary.active_budgets || 0}</strong><small>Current date range</small></article></section><section className="dash-grid"><article className="panel"><div className="section-heading"><div><h2>Recent expenses</h2><p>Latest spending activity</p></div><button className="link" onClick={()=>setPage('Expenses')}>See all</button></div><Records rows={expenses.slice(0,5)} type="expense" currency={currency} onDelete={id=>remove('/expenses/',id)} onEdit={row=>{setExpense(row);setPage('Expenses')}}/></article><article className="panel"><div className="section-heading"><div><h2>Budgets</h2><p>Spending plan progress</p></div><button className="link" onClick={()=>setPage('Budgets')}>Manage</button></div><BudgetRows rows={budgets.slice(0,4)} currency={currency} onDelete={id=>remove('/budgets/',id)} onEdit={row=>{setBudget(row);setPage('Budgets')}}/></article></section></>}
      {page === 'Expenses' && <section className="dash-grid"><article className="panel form-panel"><h2>{expense.id ? 'Edit expense' : 'Add an expense'}</h2><p>Record a purchase and choose a category.</p><form onSubmit={e=>{e.preventDefault();save('/expenses/',expense,()=>setExpense({category:'Food',amount:'',spent_on:dateNow(),description:''}))}}><label>Category<select value={expense.category} onChange={e=>setExpense({...expense,category:e.target.value})}>{['Food','Travel','Shopping','Education','Entertainment','Miscellaneous'].map(c=><option key={c}>{c}</option>)}</select></label><label>Amount<input type="number" min="0.01" step="0.01" required value={expense.amount} onChange={e=>setExpense({...expense,amount:e.target.value})}/></label><label>Date<input type="date" required value={expense.spent_on} onChange={e=>setExpense({...expense,spent_on:e.target.value})}/></label><label>Description<input value={expense.description} onChange={e=>setExpense({...expense,description:e.target.value})}/></label><button className="primary">{expense.id ? 'Save changes' : 'Add expense'}</button>{expense.id && <button type="button" className="secondary" onClick={()=>setExpense({category:'Food',amount:'',spent_on:dateNow(),description:''})}>Cancel edit</button>}</form></article><article className="panel"><h2>Expense history</h2><p>{expenses.length} records</p><Records rows={expenses} type="expense" currency={currency} onDelete={id=>remove('/expenses/',id)} onEdit={row=>setExpense(row)}/></article></section>}
      {page === 'Income' && <section className="dash-grid"><article className="panel form-panel"><h2>{income.id ? 'Edit income' : 'Add income'}</h2><p>Track pocket money, scholarships, and other income.</p><form onSubmit={e=>{e.preventDefault();save('/incomes/',income,()=>setIncome({source:'Pocket money',amount:'',received_on:dateNow(),notes:''}))}}><label>Source<input required value={income.source} onChange={e=>setIncome({...income,source:e.target.value})}/></label><label>Amount<input type="number" min="0.01" step="0.01" required value={income.amount} onChange={e=>setIncome({...income,amount:e.target.value})}/></label><label>Date received<input type="date" required value={income.received_on} onChange={e=>setIncome({...income,received_on:e.target.value})}/></label><label>Notes<input value={income.notes} onChange={e=>setIncome({...income,notes:e.target.value})}/></label><button className="primary">{income.id ? 'Save changes' : 'Add income'}</button>{income.id && <button type="button" className="secondary" onClick={()=>setIncome({source:'Pocket money',amount:'',received_on:dateNow(),notes:''})}>Cancel edit</button>}</form></article><article className="panel"><h2>Income history</h2><p>{incomes.length} records</p><Records rows={incomes} type="income" currency={currency} onDelete={id=>remove('/incomes/',id)} onEdit={row=>setIncome(row)}/></article></section>}
      {page === 'Budgets' && <section className="dash-grid"><article className="panel form-panel"><h2>{budget.id ? 'Edit budget' : 'Create a budget'}</h2><p>Set a spending limit for a date range.</p><form onSubmit={e=>{e.preventDefault();save('/budgets/',budget,()=>setBudget({name:'Monthly budget',amount:'',start_date:dateNow().slice(0,8)+'01',end_date:dateNow()}))}}><label>Budget name<input required value={budget.name} onChange={e=>setBudget({...budget,name:e.target.value})}/></label><label>Amount<input type="number" min="0.01" step="0.01" required value={budget.amount} onChange={e=>setBudget({...budget,amount:e.target.value})}/></label><label>Start date<input type="date" required value={budget.start_date} onChange={e=>setBudget({...budget,start_date:e.target.value})}/></label><label>End date<input type="date" required value={budget.end_date} onChange={e=>setBudget({...budget,end_date:e.target.value})}/></label><button className="primary">{budget.id ? 'Save changes' : 'Create budget'}</button>{budget.id && <button type="button" className="secondary" onClick={()=>setBudget({name:'Monthly budget',amount:'',start_date:dateNow().slice(0,8)+'01',end_date:dateNow()})}>Cancel edit</button>}</form></article><article className="panel"><h2>Your budgets</h2><p>Expenses are tallied over each budget date range.</p><BudgetRows rows={budgets} currency={currency} onDelete={id=>remove('/budgets/',id)} onEdit={row=>setBudget(row)}/></article></section>}
      {page === 'Profile' && <section className="panel profile-panel"><h2>Profile & preferences</h2><p>Set your display name, currency, and optional monthly allowance.</p><form onSubmit={saveProfile}><label>Display name<input value={profile.display_name || ''} onChange={e=>setProfile({...profile,display_name:e.target.value})}/></label><label>Currency code<input maxLength="3" minLength="3" value={profile.currency || 'INR'} onChange={e=>setProfile({...profile,currency:e.target.value.toUpperCase()})}/></label><label>Monthly allowance<input type="number" min="0" step="0.01" value={profile.allowance_amount || ''} onChange={e=>setProfile({...profile,allowance_amount:e.target.value || null})}/></label><button className="primary">Save profile</button></form></section>}
      <footer>BudgetBuddy · Your financial records are private to your account</footer>
    </div>
  </main>
}

function Stat({title,value,currency}) { return <article className="stat-card"><span>{title}</span><strong>{cash(value,currency)}</strong><small>This month</small></article> }
function Records({rows,type,currency,onDelete,onEdit}) {
  if (!rows.length) return <p className="empty">No {type === 'expense' ? 'expenses' : 'income'} yet.</p>
  return <div className="record-list">{rows.map(row=><div className="record" key={row.id}><span className="record-icon">{type === 'expense' ? '−' : '+'}</span><div className="record-main"><strong>{type === 'expense' ? row.category : row.source}</strong><small>{type === 'expense' ? row.spent_on : row.received_on}{(row.description||row.notes) ? ` · ${row.description||row.notes}` : ''}</small></div><strong className="record-amount">{cash(row.amount,currency)}</strong>{onEdit && <button className="edit" aria-label="Edit record" onClick={()=>onEdit(row)}>Edit</button>}<button className="delete" aria-label="Delete record" onClick={()=>onDelete(row.id)}>×</button></div>)}</div>
}
function BudgetRows({rows,currency,onDelete,onEdit}) {
  if (!rows.length) return <p className="empty">No budgets yet. Create one to track your spending.</p>
  return <div className="budget-list">{rows.map(row=><div className="budget-item" key={row.id}><div className="section-heading"><div><strong>{row.name}</strong><small>{row.start_date} — {row.end_date}</small></div><span>{onEdit && <button className="edit" onClick={()=>onEdit(row)}>Edit</button>}<button className="delete" aria-label="Delete budget" onClick={()=>onDelete(row.id)}>×</button></span></div><div className="budget-bar"><span style={{width:`${Math.min(Number(row.utilization_percent),100)}%`}}/></div><div className="budget-meta"><span>{cash(row.spent,currency)} spent · {Number(row.utilization_percent)}%</span><strong>{cash(row.remaining,currency)} left of {cash(row.amount,currency)}</strong></div></div>)}</div>
}
