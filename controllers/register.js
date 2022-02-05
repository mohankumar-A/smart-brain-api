const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }

  const hash = bcrypt.hashSync(password);
  db.transaction(async trx => {
    try {
      const isUserExists = await trx('login')
        .where('email', '=', email)
        .first()

      // already user name exits
      if(isUserExists) {
        throw new Error(`email id ${email} already taken.`);
      }

      // insert user
      const user = await trx
        .insert({
          hash: hash,
          email: email
        })
        .into("login")
        .transacting(trx);

      const users = await trx
        .insert([{
          email: email,
          name: name,
          joined: new Date()
        }])
        .into('users')
        .transacting(trx)

      if(!users) {
        throw new Error(`Users not created.`);
      }

      const data = await trx
        .select()
        .table("users")
        .where("id", "=", user[0])

      res.json(data[0]);

    } catch(e) {
      console.log(e);  // debug if needed
      res.status(400).json(e.toString());
    }

    // console.log(user);
    // res.status(400).json(`email id ${email} already taken.`);
    // trx('login')
    // .where('email', '=', email)
    // .first()
    // .then((r) => {
    //   if (r) {
    //     res.status(400).json(`email id ${email} already taken.`);
    //   }
    //   return trx.insert({
    //     hash: hash,
    //     email: email
    //   })
    //   .into('login')
    //   .then(user => {
    //     res.json(user[0]);
    //   })
    // })
    // // .then(r => {
    // //   console.log(r);
    // //   return trx('users')
    // //     .insert({
    // //       email: email,
    // //       name: name,
    // //       joined: new Date()
    // //     })
    // //     .then(user => {
    // //       res.json(user[0]);
    // //     })
    // // })
    // .then(trx.commit)
    // .catch(trx.rollback)
  });
  // .catch(err => {
  //   res.status(400).json('unable to register')
  // })
}

module.exports = {
  handleRegister: handleRegister
};


