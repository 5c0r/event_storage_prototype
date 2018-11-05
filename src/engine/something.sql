SELECT * FROM Bank.Account a 
INNER JOIN Bank.Deposits d
    ON a.AccountID = d.AccountID
INNER JOIN Bank.Withdraw w
    ON a.AccountID = w.AccountID
WHERE a.AccountID = 'A'


SELECT * FROM Bank.Events
WHERE Type='AccountDeposited' OR Type='AccountWithdrawed'
AND StreamID='A'



