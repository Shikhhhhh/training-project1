import React, { useState } from 'react';

export default function Students() {
    // initial sample data so the page shows content
    const [students, setStudents] = useState([]);

    const [nextId, setNextId] = useState(students.length + 1);

    // form state (controlled inputs)
    const [firstName, setfirstName] = useState('');
    const [lastName, setLastName] = useState('')
    const [number, setNumber] = useState('');
    const [course, setCourse] = useState('');
    const [attendance, setAttendance] = useState(''); // keep as string for the input

    function addStudentFromForm(e) {
        e.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) {
            // minimal validation: name required
            return;
        }

        // parse attendance to number and clamp 0-100
        let att = parseFloat(attendance);
        if (Number.isNaN(att)) att = 0;
        att = Math.max(0, Math.min(100, Math.round(att)));

        setStudents((prev) => [
            ...prev,
            { id: nextId, name: trimmedName, course: course || 'Undeclared', attendance: att },
        ]);
        setNextId((n) => n + 1);

        // clear form
        setName('');
        setCourse('');
        setAttendance('');
    }

    function removeStudent(id) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
    }

    return (
        <div>
            <div className="mb-4">
                    <h2 className="text-5xl text-sky-600 font-semibold font-sans tracking-tight text-center filter drop-shadow-gray-400 drop-shadow-xs">Students List</h2>
                    <div className='flex flex-col gap items-center justify-center'>
                    <form onSubmit={addStudentFromForm} className="border-2 border-gray-400 rounded-3xl bg-black tracking-tight flex flex-col space-y-5 p-10">
                        <div className="flex space-x-5">
                            <div className='bg-gray-100 hover:scale-105 shadow-gray-600 hover:shadow-sm hover:hover:bg-gray-200 transition-all duration-500 hover:border-sky-500 rounded-3xl border-2 border-gray-400'>
                                <input
                                    value={name}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="First Name"
                                    className="p-4 focus:ring-0 focus:outline-2 focus:outline-sky-500 rounded-3xl font-sans"
                                    required
                                />
                            </div>
                            <div className='bg-gray-100 hover:scale-105 shadow-gray-600 hover:shadow-sm hover:hover:bg-gray-200 transition-all duration-500 hover:border-sky-500 rounded-3xl border-2 border-gray-400'>
                                <input
                                    value={course}
                                    onChange={(e) => setLastNumber(e.target.value)}
                                    placeholder="Last Name"
                                    className="p-4 w-full focus:ring-0 focus:outline-2 focus:outline-sky-500 rounded-3xl font-sans"
                                />
                            </div>
                        </div>
                            <div className='bg-gray-100 hover:scale-105 shadow-gray-600 hover:shadow-sm hover:hover:bg-gray-200 transition-all duration-500 hover:border-sky-500 rounded-3xl border-2 border-gray-400'>
                                <input
                                    value={course}
                                    onChange={(e) => setCourse(e.target.value)}
                                    placeholder="Course"
                                    className="p-4 w-full focus:ring-0 focus:outline-2 focus:outline-sky-500 rounded-3xl font-sans"
                                />
                            </div>
                            <div className='bg-gray-100 hover:scale-105 shadow-gray-600 hover:shadow-sm hover:hover:bg-gray-200 transition-all duration-500 hover:border-sky-500 rounded-3xl border-2 border-gray-400'>
                                <input
                                onChange={(e) => setNumber(e.target.value)}
                                placeholder='Contact No.'
                                type='number'
                                value={number}
                                className="p-4 w-full focus:ring-0 focus:outline-2 focus:outline-sky-500 rounded-3xl font-sans"></input>
                            </div>               
                            <div className='bg-gray-100 hover:scale-105 shadow-gray-600 hover:shadow-sm hover:hover:bg-gray-200 transition-all duration-500 hover:border-sky-500 rounded-3xl border-2 border-gray-400'>
                                <input
                                    value={attendance}
                                    onChange={(e) => setAttendance(e.target.value)}
                                    placeholder="Attendance % (e.g. 78)"
                                    type="number"
                                    className="p-4 w-full focus:ring-0 focus:outline-2 focus:outline-sky-500 rounded-3xl font-sans"
                                />
                            </div>
                            <button type="submit" className="bg-linear-to-r to-amber-300 from-amber-600 p-3 rounded-full hover:-translate-y-0.5 shadow-md hover:shadow-amber-700 transition-all duration-300 cursor-pointer hover:scale-105 hover:tracking-wide font-sans">
                                Add student
                            </button>

                    </form>
                </div>

                <div className="mt-2 text-sm text-gray-600">Total: {students.length}</div>
            </div>

            <ul className="space-y-2">
                {students.map((student) => (
                    <li key={student.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                            <div className="">Student Info:{student.id}. {student.firstName}. {student.lastName}</div>
                            <div className="">Course:{student.course ?? '—'}</div>
                            <div className="">Attendance: {student.attendance ?? 0}%</div>
                            <div className="">Contact No.:{student.number ?? 'N/A'}</div>
                        </div>
                        <div>
                            <button onClick={() => removeStudent(student.id)} className="text-sm text-red-600">Remove</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}