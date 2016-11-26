
exports.seed = function(knex, Promise) {
  return knex('attendees').del()        // THIS WILL DELETE AND SEED THE ATTENDEES TABLE
    .then(function () {
      return knex
        .insert([
          {first_name: 'Jeffrey', last_name: 'Chang', email: 'test@test.com'},
          {first_name: 'Andrew', last_name: 'Kim', email: 'test2@test.com'},
          {first_name: 'John', last_name: 'Doe', email: 'john@doe.com'}
        ])
        .into('attendees')
        .returning('id')
        .then(function(userID) {
          return knex('events').del()   // THIS WILL DELETE AND SEED THE EVENTS TABLE
            .then(function () {
              return knex
                .insert([
                  {title: 'party', date: '2016-02-01', description: 'asdfasdf', uniqueurl: '0ZxaO9HtfEhV0Lhqcx9B'},
                  {title: 'drinks', date: '2018-01-01', description: 'qwerqwer', uniqueurl: 'drinksuniqueurl'},
                  {title: 'birthday', date: '2017-01-01', description: 'zxcvzxcv', uniqueurl: 'birthdayuniqueurl'}
                ])
                .into('events')
                .returning('id')
                .then(function(eventsID) {
                  return knex('event_times').del()    // THIS WILL DELETE AND SEED THE EVENT_TIMES TABLE
                    .then(function() {
                      return knex
                        .insert([
                          {times: '1:00', event_id: 1},
                          {times: '3:00', event_id: 1},
                          {times: '6:00', event_id: 1}
                        ])
                        .into('event_times')
                        .returning('id')
                        .then(function(eventTimesID){
                          return knex('response').del()   // THIS WILL DELETE AD SEED THE RESPONSE TABLE
                            .then(function() {
                              return knex
                                .insert([
                                  {response: 1, attendees_id: 1, event_times_id: 1},
                                  {response: 0, attendees_id: 1, event_times_id: 3},
                                  {response: 1, attendees_id: 2, event_times_id: 2}
                                ])
                                .into('response')
                            })
                        })
                    })
                })
            })
        })
    })
};
